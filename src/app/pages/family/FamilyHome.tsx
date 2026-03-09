import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  MessageCircle,
  Sun,
  X,
} from "lucide-react";
import { playSound } from "../../lib/soundUtils";
import { BackToHomeButton } from "../../components/BackToHomeButton";
import { GreetingHeader } from "../../components/GreetingHeader";
import { NavBar } from "../../components/NavBar";
import { SettingsButton } from "../../components/SettingsButton";
import { StepsTracker } from "../../components/StepsTracker";
import { TimeTextureGraph } from "../../components/TimeTextureGraph";
import { useTimeTexture } from "../../lib/useTimeTexture";
import {
  getMobilityInsight,
  getTopSummary,
  getDailyBreakout,
} from "../../lib/familyViewSummary";
import {
  getFamilyViewOpenCount,
  incrementFamilyViewOpenCount,
} from "../../lib/familyViewRateLimit";
import { evaluateAbsoluteFloor } from "../../lib/absoluteFloorAlerts";

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
        className="fixed inset-x-4 z-50 overflow-hidden rounded-[28px]"
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
          className="flex items-center justify-between px-5 py-4"
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
            <X
              size={18}
              style={{ color: "var(--amber-primary)" }}
            />
          </button>
        </div>

        <div className="h-full overflow-y-auto px-5 py-5">
          {children}
        </div>
      </div>
    </>
  );
}

export function FamilyHome() {
  const navigate = useNavigate();
  const {
    score,
    signals,
    baseline,
    personName,
    weekSignals,
    date,
  } = useTimeTexture();

  const [isMobilityModalOpen, setIsMobilityModalOpen] =
    useState(false);
  const [showRateLimitNote, setShowRateLimitNote] = useState(false);

  useEffect(() => {
    const { count } = getFamilyViewOpenCount();
    setShowRateLimitNote(count >= 2);
    incrementFamilyViewOpenCount();
  }, []);

  const firstName = personName.split(" ")[0];

  const mobility = useMemo(() => {
    return getMobilityInsight(weekSignals, baseline);
  }, [weekSignals, baseline]);

  const heroSummary = useMemo(() => {
    return getTopSummary(score, mobility.level, firstName);
  }, [score, mobility.level, firstName]);

  const weekRows = useMemo(() => {
    return getDailyBreakout(weekSignals);
  }, [weekSignals]);

  const absoluteFloor = useMemo(
    () => evaluateAbsoluteFloor(weekSignals),
    [weekSignals]
  );

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        backgroundColor: "var(--amber-background)",
        fontFamily: "Lato, sans-serif",
      }}
    >
      <SettingsButton />
      <BackToHomeButton />

      <div
        className="px-6 pt-14"
        style={{ paddingBottom: "24px" }}
      >
        <GreetingHeader
          name="Todd"
          subtitle={`Here’s how ${firstName} is doing today.`}
        />

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

        <div
          className="mb-4 rounded-[32px] p-5"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,250,243,1) 0%, rgba(255,245,232,1) 100%)",
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
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Today’s summary
          </p>

          <h2
            className="italic"
            style={{
              marginTop: 0,
              marginBottom: "18px",
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "32px",
              lineHeight: 1.05,
              color: "var(--amber-text-dark)",
            }}
          >
            {heroSummary}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => { playSound("navSelect"); navigate("/family/stats"); }}
              className="rounded-3xl px-4 py-4 text-left active:scale-[0.98] transition-transform"
              style={{
                backgroundColor: "var(--amber-card)",
                border: "1px solid rgba(196,96,26,0.10)",
                cursor: "pointer",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p
                    style={{
                      marginTop: 0,
                      marginBottom: "4px",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--amber-text-dark)",
                    }}
                  >
                    View stats
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "var(--amber-text-muted)",
                    }}
                  >
                    Full weekly view
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  style={{ color: "var(--amber-primary)" }}
                />
              </div>
            </button>

            <button
              type="button"
              onClick={() => { playSound("navSelect"); navigate("/family/messages"); }}
              className="rounded-3xl px-4 py-4 text-left active:scale-[0.98] transition-transform"
              style={{
                backgroundColor: "var(--amber-card)",
                border: "1px solid rgba(196,96,26,0.10)",
                cursor: "pointer",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p
                    style={{
                      marginTop: 0,
                      marginBottom: "4px",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--amber-text-dark)",
                    }}
                  >
                    Message {firstName}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "var(--amber-text-muted)",
                    }}
                  >
                    Open messages
                  </p>
                </div>
                <MessageCircle
                  size={18}
                  style={{ color: "var(--amber-primary)" }}
                />
              </div>
            </button>
          </div>
        </div>

        <button
          type="button"
          className="mb-4 w-full rounded-3xl p-5 text-left active:scale-[0.98] transition-transform"
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
              <CheckCircle
                size={22}
                style={{
                  color: mobility.iconColor,
                  marginTop: "2px",
                }}
              />
            ) : (
              <AlertTriangle
                size={22}
                style={{
                  color: mobility.iconColor,
                  marginTop: "2px",
                }}
              />
            )}

            <div className="flex-1">
              <p
                style={{
                  fontSize: "18px",
                  color: "var(--amber-text-dark)",
                  marginTop: 0,
                  marginBottom: "6px",
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

        <div className="mb-4 grid w-full grid-cols-2 items-stretch gap-3 min-h-[172px]">
          <div className="flex min-w-0 h-full">
            <StepsTracker todaySteps={signals.steps} fillHeight />
          </div>

          <div
            className="flex min-w-0 h-full min-h-[172px] flex-col justify-between rounded-3xl p-4"
            style={{
              backgroundColor: "var(--amber-card)",
              boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
            }}
          >
            <div>
              <Sun
                size={24}
                style={{ color: "var(--amber-primary)" }}
                className="mb-2"
              />
              <p
                style={{
                  fontSize: "20px",
                  color: "var(--amber-text-dark)",
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                {signals.timeOutside} min
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--amber-text-muted)",
                  marginTop: "2px",
                  marginBottom: "8px",
                }}
              >
                outside today
              </p>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "var(--amber-primary)",
                margin: 0,
              }}
            >
              Avg this week {mobility.weeklyAverageOutside} min
            </p>
          </div>
        </div>

        <div className="mb-4">
          <TimeTextureGraph
            weekSignals={weekSignals}
            title={`${firstName}'s week at a glance`}
            onClick={() => { playSound("navSelect"); navigate("/family/stats"); }}
            compact={true}
            showToggle={false}
            defaultRange="week"
            referenceDate={date}
          />
        </div>
      </div>

      <DetailModal
        open={isMobilityModalOpen}
        onClose={() => { playSound("pageBackChime"); setIsMobilityModalOpen(false); }}
        title="Mobility insight"
      >
        <div
          className="mb-4 rounded-3xl p-4"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 8px 32px rgba(200,120,40,0.08)",
          }}
        >
          <p
            className={
              mobility.title === "Movement looks steady"
                ? "italic"
                : undefined
            }
            style={{
              fontSize: "22px",
              fontFamily: "Cormorant Garamond, serif",
              color: mobility.cardAccent,
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

        <div className="mb-4 grid grid-cols-2 gap-3">
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
              {mobility.weeklyAverageSteps.toLocaleString()}
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
              {mobility.weeklyAverageOutside} min
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
              marginBottom: "12px",
            }}
          >
            Daily detail
          </p>

          <div className="space-y-3">
            {weekRows.map((row) => (
              <div
                key={row.date}
                className="rounded-2xl p-3"
                style={{ backgroundColor: "#FDF7EF" }}
              >
                <div className="mb-2 flex items-center justify-between">
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
                    margin: 0,
                  }}
                >
                  {row.steps.toLocaleString()} steps •{" "}
                  {row.timeOutside} min outside
                </p>
              </div>
            ))}
          </div>
        </div>
      </DetailModal>

      <NavBar type="family" />
    </div>
  );
}