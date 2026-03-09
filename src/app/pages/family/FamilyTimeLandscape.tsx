import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { format, parseISO } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { playSound } from "../../lib/soundUtils";
import { NavBar } from "../../components/NavBar";
import { TimeTextureGraph } from "../../components/TimeTextureGraph";
import { useTimeTexture } from "../../lib/useTimeTexture";
import { useDebug } from "../../lib/debugContext";
import { scoreTimeTexture } from "../../lib/timeTexture/scoreTimeTexture";

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

export function FamilyTimeLandscape() {
  const navigate = useNavigate();
  const location = useLocation();
  const { weekSignals, personName } = useTimeTexture();
  const { selectedDate } = useDebug();

  const firstName = personName.split(" ")[0];

  const returnTo =
    typeof location.state?.returnTo === "string"
      ? location.state.returnTo
      : "/family";

  const dateRange = useMemo(() => {
    if (weekSignals.length === 0) {
      try {
        const d = parseISO(selectedDate);
        const start = new Date(d);
        start.setDate(start.getDate() - 6);
        return `${format(start, "MMM d")} – ${format(d, "MMM d")}`;
      } catch {
        return "This week";
      }
    }

    try {
      const first = format(parseISO(weekSignals[0].date), "MMM d");
      const last = format(
        parseISO(weekSignals[weekSignals.length - 1].date),
        "MMM d",
      );
      return `${first} – ${last}`;
    } catch {
      return "This week";
    }
  }, [weekSignals, selectedDate]);

  const weeklyAverageScore = useMemo(() => {
    return average(
      weekSignals.map((day) => scoreTimeTexture(day.signals).score),
    );
  }, [weekSignals]);

  const weekSummary = useMemo(() => {
    if (weekSignals.length < 2) {
      return `Explore ${firstName}'s week in time texture.`;
    }

    if (weeklyAverageScore >= 55) {
      return `${firstName}'s week felt fuller than usual ↑`;
    }

    if (weeklyAverageScore >= 35) {
      return `${firstName}'s week had a steady, balanced rhythm.`;
    }

    return `${firstName}'s week felt quieter than usual.`;
  }, [weekSignals, weeklyAverageScore, firstName]);

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        backgroundColor: "var(--amber-background)",
        fontFamily: "Lato, sans-serif",
      }}
    >
      <div className="px-6 pt-16">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => { playSound("pageBackChime"); navigate(returnTo); }}
            className="mb-4 flex items-center gap-2"
            style={{ color: "var(--amber-primary)" }}
            aria-label="Back"
          >
            <ChevronLeft size={24} />
          </button>

          <h1
            className="mb-1"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "var(--font-title, 28px)",
              color: "var(--amber-text-dark)",
            }}
          >
            {firstName}'s Time Landscape
          </h1>

          <p
            style={{
              fontSize: "var(--font-body, 15px)",
              color: "var(--amber-text-muted)",
            }}
          >
            {dateRange}
          </p>
        </div>

        <div className="mb-6">
          <TimeTextureGraph
            weekSignals={weekSignals}
            showToggle={true}
            defaultRange="week"
            referenceDate={selectedDate}
          />
        </div>

        <div
          className="rounded-3xl p-4"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 8px 32px rgba(200, 120, 40, 0.10)",
          }}
        >
          <p
            className="italic text-center"
            style={{
              fontSize: "15px",
              color: "var(--amber-text-muted)",
              fontFamily: "Lato, sans-serif",
            }}
          >
            {weekSummary}
          </p>
        </div>
      </div>

      <NavBar type="family" />
    </div>
  );
}