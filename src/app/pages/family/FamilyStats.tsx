import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  ChevronLeft,
  CheckCircle,
  Footprints,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { NavBar } from "../../components/NavBar";
import { TimeTextureGraph } from "../../components/TimeTextureGraph";
import { playSound } from "../../lib/soundUtils";
import { useTimeTexture } from "../../lib/useTimeTexture";
import { useDebug } from "../../lib/debugContext";
import { scoreTimeTexture } from "../../lib/timeTexture/scoreTimeTexture";
import {
  getFamilyViewOpenCount,
  incrementFamilyViewOpenCount,
} from "../../lib/familyViewRateLimit";
import { evaluateAbsoluteFloor } from "../../lib/absoluteFloorAlerts";

type MobilityLevel = "steady" | "watch" | "lower" | "unknown";

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatSignedPercent(value: number): string {
  if (value === 0) return "0%";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function formatDelta(current: number, baseline?: number | null): number | null {
  if (!baseline || baseline <= 0) return null;
  return Math.round(((current - baseline) / baseline) * 100);
}

function getFullDayLabel(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString(undefined, { weekday: "long" });
}

function getShortDayLabel(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString(undefined, { weekday: "short" });
}

function getMobilityInsight(
  weekSignals: { date: string; signals: { steps: number; timeOutside: number } }[],
  baseline: { steps: number; timeOutside: number } | null,
) {
  const weeklyAverageSteps = average(weekSignals.map((day) => day.signals.steps));
  const weeklyAverageOutside = average(
    weekSignals.map((day) => day.signals.timeOutside),
  );

  if (!baseline) {
    return {
      level: "unknown" as MobilityLevel,
      title: "Still learning the routine",
      summary:
        "There is not enough baseline history yet to say whether this week looks usual or unusually quiet.",
      accentColor: "var(--amber-text-muted)",
      iconColor: "var(--amber-text-muted)",
      stepDelta: null as number | null,
      outsideDelta: null as number | null,
      disclaimer:
        "This view is based only on recent steps and outdoor time in the app. It is not a medical assessment.",
    };
  }

  const stepDelta = formatDelta(weeklyAverageSteps, baseline.steps);
  const outsideDelta = formatDelta(weeklyAverageOutside, baseline.timeOutside);

  let score = 0;
  if ((stepDelta ?? 0) <= -12) score += 1;
  if ((stepDelta ?? 0) <= -25) score += 1;
  if ((outsideDelta ?? 0) <= -15) score += 1;
  if ((outsideDelta ?? 0) <= -30) score += 1;

  if (score >= 3) {
    return {
      level: "lower" as MobilityLevel,
      title: "Lower movement this week",
      summary:
        "This week looks quieter than usual, with both movement and outdoor time below recent baseline.",
      accentColor: "#C7702A",
      iconColor: "#C7702A",
      stepDelta,
      outsideDelta,
      disclaimer:
        "This view is based only on recent steps and outdoor time in the app. It is not a medical assessment.",
    };
  }

  if (score >= 1) {
    return {
      level: "watch" as MobilityLevel,
      title: "A little quieter than usual",
      summary:
        "There is a small dip in activity compared with recent baseline, but not a dramatic change.",
      accentColor: "var(--amber-primary)",
      iconColor: "var(--amber-primary)",
      stepDelta,
      outsideDelta,
      disclaimer:
        "This view is based only on recent steps and outdoor time in the app. It is not a medical assessment.",
    };
  }

  return {
    level: "steady" as MobilityLevel,
    title: "Movement looks steady",
    summary: "This week is broadly in line with recent routine.",
    accentColor: "var(--amber-stat-green)",
    iconColor: "var(--amber-stat-green)",
    stepDelta,
    outsideDelta,
    disclaimer:
      "This view is based only on recent steps and outdoor time in the app. It is not a medical assessment.",
  };
}

function getWeeklyHeadline(
  weeklyAverageScore: number,
  mobilityLevel: MobilityLevel,
  firstName: string,
): string {
  if (mobilityLevel === "lower") {
    return `${firstName} had a quieter week than usual.`;
  }

  if (mobilityLevel === "watch") {
    return `${firstName} had a slightly softer week than usual.`;
  }

  if (mobilityLevel === "unknown") {
    return `This week helps build a better sense of ${firstName}'s routine.`;
  }

  if (weeklyAverageScore >= 70) {
    return `${firstName} had an engaged and active week.`;
  }

  if (weeklyAverageScore >= 55) {
    return `${firstName} had a steady week overall.`;
  }

  return `${firstName} had a gentler week overall.`;
}

function getWeekRows(
  weekSignals: { date: string; signals: { steps: number; timeOutside: number } }[],
) {
  return weekSignals.map((day) => ({
    date: day.date,
    dayLabel: getShortDayLabel(day.date),
    fullDayLabel: getFullDayLabel(day.date),
    score: scoreTimeTexture(day.signals).score,
    steps: day.signals.steps,
    timeOutside: day.signals.timeOutside,
  }));
}

function getWeeklyInsights(
  weekRows: {
    date: string;
    dayLabel: string;
    fullDayLabel: string;
    score: number;
    steps: number;
    timeOutside: number;
  }[],
  weeklyAverageOutside: number,
) {
  if (!weekRows.length) return [];

  const lowestScoreDay = weekRows.reduce((lowest, row) =>
    row.score < lowest.score ? row : lowest,
  );

  const highestScoreDay = weekRows.reduce((highest, row) =>
    row.score > highest.score ? row : highest,
  );

  const lowestStepsDay = weekRows.reduce((lowest, row) =>
    row.steps < lowest.steps ? row : lowest,
  );

  const weekendOutside = weekRows
    .filter((row) => row.dayLabel === "Sat" || row.dayLabel === "Sun")
    .reduce((sum, row) => sum + row.timeOutside, 0);

  const weekdayOutside = weekRows
    .filter((row) => row.dayLabel !== "Sat" && row.dayLabel !== "Sun")
    .reduce((sum, row) => sum + row.timeOutside, 0);

  const weekendAverageOutside = Math.round(weekendOutside / 2 || 0);
  const weekdayAverageOutside = Math.round(weekdayOutside / 5 || 0);

  return [
    {
      title: "Strongest day",
      text: `${highestScoreDay.fullDayLabel} had the richest overall texture this week, with a score of ${highestScoreDay.score}.`,
    },
    {
      title: "Quietest day",
      text: `${lowestScoreDay.fullDayLabel} was the softest day this week, with lower overall texture and ${lowestStepsDay.steps.toLocaleString()} steps on ${lowestStepsDay.fullDayLabel}.`,
    },
    {
      title: "Outdoor rhythm",
      text:
        weekendAverageOutside > weekdayAverageOutside
          ? `Outdoor time was stronger on the weekend (${weekendAverageOutside} min/day) than on weekdays (${weekdayAverageOutside} min/day).`
          : `Outdoor time stayed fairly even through the week, averaging about ${weeklyAverageOutside} minutes per day.`,
    },
  ];
}

function DetailModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(44, 27, 12, 0.34)" }}
        onClick={onClose}
      />

      <div
        className="fixed inset-x-4 z-50 rounded-[28px] overflow-hidden"
        style={{
          top: "68px",
          bottom: "110px",
          maxWidth: "520px",
          margin: "0 auto",
          backgroundColor: "var(--amber-background)",
          boxShadow: "0px 20px 64px rgba(100,60,20,0.24)",
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            backgroundColor: "var(--amber-card)",
            borderBottom: "1px solid rgba(196,96,26,0.10)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "24px",
              color: "var(--amber-text-dark)",
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 active:scale-95 transition-transform"
            style={{ backgroundColor: "rgba(196,96,26,0.08)" }}
            aria-label="Close details"
          >
            <X size={18} style={{ color: "var(--amber-primary)" }} />
          </button>
        </div>

        <div className="h-full overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </>
  );
}

export function FamilyStats() {
  const navigate = useNavigate();
  const { currentPerson } = useDebug();
  const {
    signals,
    baseline,
    personName,
    weekSignals,
  } = useTimeTexture();

  const [isMobilityModalOpen, setIsMobilityModalOpen] = useState(false);
  const [showRateLimitNote, setShowRateLimitNote] = useState(false);

  useEffect(() => {
    const { count } = getFamilyViewOpenCount();
    setShowRateLimitNote(count >= 2);
    incrementFamilyViewOpenCount();
  }, []);

  const firstName = personName.split(" ")[0];

  const weekRows = useMemo(() => getWeekRows(weekSignals), [weekSignals]);

  const weeklyAverageScore = useMemo(() => {
    return average(weekRows.map((day) => day.score));
  }, [weekRows]);

  const weeklyAverageSteps = useMemo(() => {
    return average(weekRows.map((day) => day.steps));
  }, [weekRows]);

  const weeklyAverageOutside = useMemo(() => {
    return average(weekRows.map((day) => day.timeOutside));
  }, [weekRows]);

  const stepDelta = useMemo(
    () => formatDelta(weeklyAverageSteps, baseline?.steps),
    [weeklyAverageSteps, baseline],
  );

  const outsideDelta = useMemo(
    () => formatDelta(weeklyAverageOutside, baseline?.timeOutside),
    [weeklyAverageOutside, baseline],
  );

  const scoreDelta = useMemo(() => {
    if (!baseline) return null;
    const baselineScore = scoreTimeTexture(baseline).score;
    return weeklyAverageScore - baselineScore;
  }, [baseline, weeklyAverageScore]);

  const mobility = useMemo(() => {
    return getMobilityInsight(weekSignals, baseline);
  }, [weekSignals, baseline]);

  const weeklyHeadline = useMemo(() => {
    return getWeeklyHeadline(weeklyAverageScore, mobility.level, firstName);
  }, [weeklyAverageScore, mobility.level, firstName]);

  const weeklyInsights = useMemo(() => {
    return getWeeklyInsights(weekRows, weeklyAverageOutside);
  }, [weekRows, weeklyAverageOutside]);

  const absoluteFloor = useMemo(
    () => evaluateAbsoluteFloor(weekSignals),
    [weekSignals]
  );

  const handleOpenFamilyLandscape = () => {
    playSound("navSelect");
    navigate("/family/time-landscape-family");
  };

  const handleGraphKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenFamilyLandscape();
    }
  };

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        backgroundColor: "var(--amber-background)",
        fontFamily: "Lato, sans-serif",
      }}
    >
      <div className="px-6 pt-16">
        {absoluteFloor.triggered && (
          <div
            className="mb-4 rounded-3xl p-4"
            style={{
              backgroundColor: "rgba(255,248,240,0.98)",
              border: "1px solid rgba(196,96,26,0.22)",
              boxShadow: "0px 6px 20px rgba(200,120,40,0.1)",
            }}
          >
            <p
              style={{
                margin: "0 0 6px 0",
                fontFamily: "Lato, sans-serif",
                fontSize: "17px",
                lineHeight: 1.4,
                color: "var(--amber-text-dark)",
                fontWeight: 600,
              }}
            >
              We've noticed something that might be worth checking in about.
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "Lato, sans-serif",
                fontSize: "14px",
                lineHeight: 1.45,
                color: "var(--amber-text-muted)",
              }}
            >
              This is based on simple activity thresholds, not their usual pattern.
            </p>
          </div>
        )}

        {showRateLimitNote && (
          <div
            className="mb-4 rounded-3xl p-4"
            style={{
              backgroundColor: "rgba(255,250,243,0.95)",
              border: "1px solid rgba(196,96,26,0.18)",
              boxShadow: "0px 6px 20px rgba(200,120,40,0.08)",
            }}
          >
            <p
              className="italic"
              style={{
                margin: "0 0 6px 0",
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "18px",
                lineHeight: 1.35,
                color: "#8B691E",
              }}
            >
              Sometimes a quiet day is just a quiet day.
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "Lato, sans-serif",
                fontSize: "14px",
                lineHeight: 1.45,
                color: "var(--amber-text-muted)",
              }}
            >
              Checking in is great; you might find 7-day trends more helpful than single days.
            </p>
          </div>
        )}

        <div className="mb-5">
          <button
            type="button"
            onClick={() => { playSound("pageBackChime"); navigate("/family"); }}
            className="mb-4 flex items-center gap-2"
            style={{ color: "var(--amber-primary)", cursor: "pointer" }}
            aria-label="Back to family home"
          >
            <ChevronLeft size={24} />
          </button>

          <p
            style={{
              fontSize: "13px",
              color: "var(--amber-text-muted)",
              marginTop: 0,
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            Weekly stats
          </p>

          <h1
            className="italic"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "34px",
              lineHeight: 1.05,
              color: "var(--amber-primary)",
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            {weeklyHeadline}
          </h1>
        </div>

        <div
          className="rounded-[32px] p-5 mb-4"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 12px 36px rgba(200,120,40,0.12)",
            border: "1px solid rgba(196,96,26,0.08)",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "var(--amber-text-muted)",
              marginTop: 0,
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            This week at a glance
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div
              className="rounded-3xl p-4"
              style={{ backgroundColor: "var(--amber-card)" }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--amber-text-muted)",
                  marginTop: 0,
                  marginBottom: "6px",
                }}
              >
                Texture score
              </p>
              <p
                style={{
                  fontSize: "26px",
                  color: "var(--amber-text-dark)",
                  marginTop: 0,
                  marginBottom: "4px",
                  fontWeight: 700,
                }}
              >
                {weeklyAverageScore}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--amber-primary)",
                  margin: 0,
                }}
              >
                {scoreDelta === null
                  ? "No baseline yet"
                  : `${scoreDelta > 0 ? "+" : ""}${scoreDelta} vs baseline`}
              </p>
            </div>

            <div
              className="rounded-3xl p-4"
              style={{ backgroundColor: "var(--amber-card)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Footprints size={16} style={{ color: "var(--amber-primary)" }} />
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--amber-text-muted)",
                    margin: 0,
                  }}
                >
                  Average daily steps
                </p>
              </div>
              <p
                style={{
                  fontSize: "26px",
                  color: "var(--amber-text-dark)",
                  marginTop: 0,
                  marginBottom: "4px",
                  fontWeight: 700,
                }}
              >
                {weeklyAverageSteps.toLocaleString()}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--amber-primary)",
                  margin: 0,
                }}
              >
                {stepDelta === null
                  ? "No baseline yet"
                  : `${formatSignedPercent(stepDelta)} vs baseline`}
              </p>
            </div>

            <div
              className="rounded-3xl p-4"
              style={{ backgroundColor: "var(--amber-card)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sun size={16} style={{ color: "var(--amber-primary)" }} />
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--amber-text-muted)",
                    margin: 0,
                  }}
                >
                  Outdoor time
                </p>
              </div>
              <p
                style={{
                  fontSize: "26px",
                  color: "var(--amber-text-dark)",
                  marginTop: 0,
                  marginBottom: "4px",
                  fontWeight: 700,
                }}
              >
                {weeklyAverageOutside} min
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--amber-primary)",
                  margin: 0,
                }}
              >
                {outsideDelta === null
                  ? "No baseline yet"
                  : `${formatSignedPercent(outsideDelta)} vs baseline`}
              </p>
            </div>
          </div>
        </div>

        <div
          className="mb-4 rounded-[32px] focus:outline-none focus:ring-2"
          style={{ borderRadius: "32px" }}
          onClick={handleOpenFamilyLandscape}
          onKeyDown={handleGraphKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`Open ${firstName}'s family time landscape`}
        >
          <TimeTextureGraph
            weekSignals={weekSignals}
            title={`${firstName}'s weekly texture`}
            compact={false}
            showToggle={false}
            defaultRange="week"
            onClick={handleOpenFamilyLandscape}
          />
        </div>

        <div
          className="rounded-3xl p-5 mb-4"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              color: "var(--amber-text-dark)",
              marginTop: 0,
              marginBottom: "12px",
              fontWeight: 700,
            }}
          >
            What changed this week
          </p>

          <div className="space-y-3">
            {weeklyInsights.map((insight) => (
              <div
                key={insight.title}
                className="rounded-2xl p-4"
                style={{ backgroundColor: "#FDF7EF" }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--amber-primary)",
                    marginTop: 0,
                    marginBottom: "6px",
                    fontWeight: 700,
                  }}
                >
                  {insight.title}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--amber-text-dark)",
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-3xl p-5 mb-4"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <UserRound size={22} style={{ color: "var(--amber-primary)", marginTop: "2px" }} />
            <div>
              <p
                style={{
                  fontSize: "18px",
                  color: "var(--amber-text-dark)",
                  marginTop: 0,
                  marginBottom: "4px",
                  fontWeight: 700,
                }}
              >
                Profile
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--amber-text-muted)",
                  margin: 0,
                }}
              >
                Data shown here comes from the current person record in the dataset.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-3"
              style={{ backgroundColor: "#FDF7EF" }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--amber-text-muted)",
                  marginTop: 0,
                  marginBottom: "6px",
                }}
              >
                Name
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--amber-text-dark)",
                  margin: 0,
                }}
              >
                {currentPerson?.name ?? personName}
              </p>
            </div>

            <div
              className="rounded-2xl p-3"
              style={{ backgroundColor: "#FDF7EF" }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--amber-text-muted)",
                  marginTop: 0,
                  marginBottom: "6px",
                }}
              >
                Age
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--amber-text-dark)",
                  margin: 0,
                }}
              >
                {currentPerson?.age ?? "Unavailable"}
              </p>
            </div>

            <div
              className="rounded-2xl p-3 col-span-2"
              style={{ backgroundColor: "#FDF7EF" }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--amber-text-muted)",
                  marginTop: 0,
                  marginBottom: "6px",
                }}
              >
                Profile
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--amber-text-dark)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {currentPerson?.profile ?? "Unavailable"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-3xl p-4 mb-4 text-left active:scale-[0.98] transition-transform"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
            cursor: "pointer",
            border: "1px solid rgba(196,96,26,0.08)",
          }}
          onClick={() => { playSound("navSelect"); setIsMobilityModalOpen(true); }}
        >
          <div className="flex items-start gap-3">
            {mobility.level === "steady" ? (
              <CheckCircle size={22} style={{ color: mobility.iconColor, marginTop: "2px" }} />
            ) : (
              <AlertTriangle size={22} style={{ color: mobility.iconColor, marginTop: "2px" }} />
            )}

            <div className="flex-1">
              <p
                style={{
                  fontSize: "18px",
                  color: "var(--amber-text-dark)",
                  marginTop: 0,
                  marginBottom: "4px",
                  fontWeight: 700,
                }}
              >
                Mobility insight: {mobility.title}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--amber-text-dark)",
                  marginTop: 0,
                  marginBottom: 0,
                  lineHeight: 1.5,
                }}
              >
                {mobility.summary}
              </p>
            </div>
          </div>
        </button>

        <div
          className="rounded-3xl p-5"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              color: "var(--amber-text-dark)",
              marginTop: 0,
              marginBottom: "12px",
              fontWeight: 700,
            }}
          >
            Daily breakdown
          </p>

          <div className="space-y-3">
            {weekRows.map((row) => (
              <div
                key={row.date}
                className="rounded-2xl p-4"
                style={{ backgroundColor: "#FDF7EF" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p
                    style={{
                      fontSize: "15px",
                      color: "var(--amber-text-dark)",
                      margin: 0,
                      fontWeight: 700,
                    }}
                  >
                    {row.dayLabel}
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--amber-primary)",
                      margin: 0,
                    }}
                  >
                    Score {row.score}
                  </p>
                </div>

                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--amber-text-muted)",
                    marginTop: 0,
                    marginBottom: "6px",
                    lineHeight: 1.5,
                  }}
                >
                  {row.steps.toLocaleString()} steps • {row.timeOutside} min outside
                </p>

                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--amber-primary)",
                    margin: 0,
                  }}
                >
                  {row.steps >= weeklyAverageSteps
                    ? "Above weekly step average"
                    : "Below weekly step average"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DetailModal
        open={isMobilityModalOpen}
        onClose={() => { playSound("pageBackChime"); setIsMobilityModalOpen(false); }}
        title="Mobility insight"
      >
        <div
          className="rounded-3xl p-4 mb-4"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 8px 32px rgba(200,120,40,0.08)",
          }}
        >
          <p
            className={mobility.title === "Movement looks steady" ? "italic" : undefined}
            style={{
              fontSize: "22px",
              fontFamily: "Cormorant Garamond, serif",
              color: mobility.accentColor,
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            {mobility.title}
          </p>
          <p
            style={{
              fontSize: "15px",
              color: "var(--amber-text-dark)",
              marginTop: 0,
              marginBottom: "10px",
              lineHeight: 1.55,
            }}
          >
            {mobility.summary}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--amber-text-muted)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {mobility.disclaimer}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-3xl p-4"
            style={{ backgroundColor: "var(--amber-card)" }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "var(--amber-text-muted)",
                marginTop: 0,
                marginBottom: "6px",
              }}
            >
              Weekly average steps
            </p>
            <p
              style={{
                fontSize: "22px",
                color: "var(--amber-text-dark)",
                marginTop: 0,
                marginBottom: "4px",
                fontWeight: 700,
              }}
            >
              {weeklyAverageSteps.toLocaleString()}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--amber-primary)",
                margin: 0,
              }}
            >
              {mobility.stepDelta === null
                ? "No baseline yet"
                : `${formatSignedPercent(mobility.stepDelta)} vs baseline`}
            </p>
          </div>

          <div
            className="rounded-3xl p-4"
            style={{ backgroundColor: "var(--amber-card)" }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "var(--amber-text-muted)",
                marginTop: 0,
                marginBottom: "6px",
              }}
            >
              Weekly outdoor time
            </p>
            <p
              style={{
                fontSize: "22px",
                color: "var(--amber-text-dark)",
                marginTop: 0,
                marginBottom: "4px",
                fontWeight: 700,
              }}
            >
              {weeklyAverageOutside} min
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--amber-primary)",
                margin: 0,
              }}
            >
              {mobility.outsideDelta === null
                ? "No baseline yet"
                : `${formatSignedPercent(mobility.outsideDelta)} vs baseline`}
            </p>
          </div>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{ backgroundColor: "var(--amber-card)" }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "var(--amber-text-muted)",
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            Current day signals
          </p>
          <p
            style={{
              fontSize: "15px",
              color: "var(--amber-text-dark)",
              marginTop: 0,
              marginBottom: "6px",
            }}
          >
            {signals.steps.toLocaleString()} steps today
          </p>
          <p
            style={{
              fontSize: "15px",
              color: "var(--amber-text-dark)",
              margin: 0,
            }}
          >
            {signals.timeOutside} minutes outside today
          </p>
        </div>
      </DetailModal>

      <NavBar type="family" />
    </div>
  );
}