/**
 * Family View Summary — Single source for what family sees
 *
 * Used by the family UI (FamilyHome, FamilyStats) and the user's
 * "What family sees" preview in Settings. Keeps metrics and wording identical.
 */

import { scoreTimeTexture } from "./timeTexture/scoreTimeTexture";
import type { SignalSet } from "./timeTexture/types";

/** Metrics that family can see when "Share wellbeing" is on. Single source of truth. */
export const FAMILY_VISIBLE_METRICS: readonly { id: string; label: string }[] = [
  { id: "timeTextureTrend", label: "7-day Time Texture trend" },
  { id: "weeklySteps", label: "Weekly steps average" },
  { id: "weeklyTimeOutside", label: "Weekly time outside" },
  { id: "movementSummary", label: "Movement summary (steady / a little quieter / lower movement)" },
] as const;

export type MobilityLevel = "steady" | "watch" | "lower" | "unknown";

export interface MobilityInsight {
  level: MobilityLevel;
  title: string;
  summary: string;
  cardAccent?: string;
  iconColor: string;
  disclaimer: string;
  weeklyAverageSteps?: number;
  weeklyAverageOutside?: number;
  stepDelta?: number | null;
  outsideDelta?: number | null;
}

export interface DailyBreakoutRow {
  date: string;
  dayLabel: string;
  score: number;
  steps: number;
  timeOutside: number;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function formatDelta(
  current: number,
  baseline?: number | null
): number | null {
  if (!baseline || baseline <= 0) return null;
  return Math.round(((current - baseline) / baseline) * 100);
}

function getDayLabel(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString(undefined, { weekday: "short" });
}

type WeekSignalsInput = {
  date: string;
  signals: { steps: number; timeOutside: number };
}[];

/**
 * Same logic as family dashboard: mobility vs personal baseline.
 * Used by FamilyHome and Settings "What family sees" preview.
 */
export function getMobilityInsight(
  weekSignals: WeekSignalsInput,
  baseline: { steps: number; timeOutside: number } | null
): MobilityInsight {
  const weeklyAverageSteps = average(
    weekSignals.map((day) => day.signals.steps)
  );
  const weeklyAverageOutside = average(
    weekSignals.map((day) => day.signals.timeOutside)
  );

  if (!baseline) {
    return {
      level: "unknown",
      title: "Still learning the routine",
      summary:
        "There is not enough baseline history yet to say whether this week looks usual or unusually quiet.",
      cardAccent: "var(--amber-text-muted)",
      iconColor: "var(--amber-text-muted)",
      disclaimer:
        "This view is based only on recent steps and outdoor time in the app. It is not a medical assessment.",
      weeklyAverageSteps,
      weeklyAverageOutside,
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
      level: "lower",
      title: "Lower movement this week",
      summary:
        "This week looks quieter than usual, with both movement and outdoor time below recent baseline.",
      cardAccent: "#C7702A",
      iconColor: "#C7702A",
      disclaimer:
        "This view is based only on recent steps and outdoor time in the app. It is not a medical assessment.",
      weeklyAverageSteps,
      weeklyAverageOutside,
      stepDelta,
      outsideDelta,
    };
  }

  if (score >= 1) {
    return {
      level: "watch",
      title: "A little quieter than usual",
      summary:
        "There is a small dip in activity compared with recent baseline, but not a dramatic change.",
      cardAccent: "var(--amber-primary)",
      iconColor: "var(--amber-primary)",
      disclaimer:
        "This view is based only on recent steps and outdoor time in the app. It is not a medical assessment.",
      weeklyAverageSteps,
      weeklyAverageOutside,
      stepDelta,
      outsideDelta,
    };
  }

  return {
    level: "steady",
    title: "Movement looks steady",
    summary: "This week is broadly in line with recent routine.",
    cardAccent: "var(--amber-stat-green)",
    iconColor: "var(--amber-stat-green)",
    disclaimer:
      "This view is based only on recent steps and outdoor time in the app. It is not a medical assessment.",
    weeklyAverageSteps,
    weeklyAverageOutside,
    stepDelta,
    outsideDelta,
  };
}

/**
 * Hero summary line shown on family dashboard (today's summary).
 * Used by FamilyHome and Settings preview.
 */
export function getTopSummary(
  textureScore: number,
  mobilityLevel: MobilityLevel,
  firstName: string
): string {
  if (mobilityLevel === "lower") {
    return `${firstName} seems quieter than usual right now.`;
  }
  if (mobilityLevel === "watch") {
    return `${firstName} looks a little softer than usual today.`;
  }
  if (mobilityLevel === "unknown") {
    return `${firstName}'s routine is still being learned.`;
  }
  if (textureScore >= 70) {
    return `${firstName} seems engaged and moving well today.`;
  }
  if (textureScore >= 55) {
    return `${firstName} seems close to usual today.`;
  }
  return `${firstName} seems to be having a gentler day today.`;
}

/**
 * Per-day breakdown for 7-day view. Same shape as family dashboard.
 */
export function getDailyBreakout(
  weekSignals: { date: string; signals: SignalSet }[]
): DailyBreakoutRow[] {
  return weekSignals.map((day) => ({
    date: day.date,
    dayLabel: getDayLabel(day.date),
    score: scoreTimeTexture(day.signals).score,
    steps: day.signals.steps,
    timeOutside: day.signals.timeOutside,
  }));
}
