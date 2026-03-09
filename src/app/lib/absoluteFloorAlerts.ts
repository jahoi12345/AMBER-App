/**
 * Absolute Floor Alerts — Edge Case 02: Genuine Emergency Undetected
 *
 * Hard thresholds that fire regardless of the user's personal baseline.
 * Complements the relative system (Time Texture vs baseline) so that
 * a real decline (e.g. after a fall) is not missed when baseline is already low.
 */

import type { SignalSet } from "./timeTexture/types";

/** Steps below this for 3 consecutive days triggers the absolute-floor nudge. */
const STEPS_FLOOR = 200;

/** Number of consecutive days that must be below the threshold to trigger. */
const CONSECUTIVE_DAYS_REQUIRED = 3;

export interface AbsoluteFloorResult {
  triggered: boolean;
  reason?: "steps" | "heartRate";
}

type DaySignals = { date: string; signals: SignalSet }[];

/**
 * Checks if the last 3 consecutive days each have steps < STEPS_FLOOR (200).
 * Uses the most recent 3 days in weekSignals (array is chronological, end date last).
 */
function checkStepsFloor(weekSignals: DaySignals): boolean {
  if (weekSignals.length < CONSECUTIVE_DAYS_REQUIRED) return false;
  const lastThree = weekSignals.slice(-CONSECUTIVE_DAYS_REQUIRED);
  return lastThree.every((day) => day.signals.steps < STEPS_FLOOR);
}

/**
 * Placeholder for future Cairn/heart-rate integration.
 * If any of the last 3 days has a heart-rate anomaly flag, trigger.
 * (SignalSet has no anomaly field yet; can be added when integration exists.)
 */
function checkHeartRateAnomaly(_weekSignals: DaySignals): boolean {
  // Stub: no heart rate anomaly data in SignalSet yet.
  return false;
}

/**
 * Evaluates absolute-floor rules on the given week of signals.
 * Returns { triggered: true, reason } when any rule fires, so the family
 * view can show the single "worth checking in" nudge.
 */
export function evaluateAbsoluteFloor(
  weekSignals: DaySignals
): AbsoluteFloorResult {
  if (checkStepsFloor(weekSignals)) {
    return { triggered: true, reason: "steps" };
  }
  if (checkHeartRateAnomaly(weekSignals)) {
    return { triggered: true, reason: "heartRate" };
  }
  return { triggered: false };
}
