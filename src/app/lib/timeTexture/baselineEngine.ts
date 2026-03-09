/**
 * Baseline Engine
 *
 * Compares today's signals against the user's historical baseline
 * to determine how novel or routine the current day feels.
 *
 * The core insight: an activity that's common for this user contributes
 * less novelty than one that's rare. Walking 3,000 steps is exciting
 * for someone who usually walks 500, but routine for someone at 4,000.
 */

/**
 * Compute how far today's value deviates from the user's baseline.
 *
 * Returns a value between 0 and 1:
 * - 0 means today matches the baseline exactly
 * - 1 means today is dramatically different (2x or more above baseline)
 *
 * Negative deviations (less activity than baseline) are treated as
 * smaller deltas — the system rewards new effort, not penalizes rest.
 *
 * @param todayValue - The raw signal value for today
 * @param baseline   - The user's historical average for this signal
 * @returns A normalized delta between 0 and 1
 */
export function computeBaselineDelta(todayValue: number, baseline: number): number {
  // Guard against division by zero
  if (baseline <= 0) {
    return todayValue > 0 ? 1 : 0;
  }

  const ratio = todayValue / baseline;

  // Above baseline: increasing novelty (capped at 2x = full novelty)
  if (ratio >= 1) {
    return Math.min((ratio - 1) / 1, 1);
  }

  // Below baseline: mild negative signal, but not punitive
  // Being at 50% of baseline yields ~0.15 delta (low, not zero)
  return Math.max(0, (1 - ratio) * 0.3);
}

/**
 * Adjust novelty based on how frequently a signal occurs in the user's history.
 *
 * @param signalFrequency - Fraction of days (0–1) where this signal was present
 *                          e.g., 0.8 means the user does this 80% of days
 * @returns A multiplier between 0.3 and 1.5
 *
 * Behavior:
 * - >40% frequency (habitual)   -> low novelty boost   (0.3–0.7x)
 * - 10–40% frequency (moderate) -> standard boost       (0.7–1.0x)
 * - <10% frequency (rare)       -> high novelty boost   (1.0–1.5x)
 */
export function computeHabitAdjustment(signalFrequency: number): number {
  const freq = Math.max(0, Math.min(1, signalFrequency));

  if (freq > 0.4) {
    // Habitual: scale linearly from 0.7 (at 40%) to 0.3 (at 100%)
    return 0.7 - ((freq - 0.4) / 0.6) * 0.4;
  }

  if (freq >= 0.1) {
    // Moderate: scale from 1.0 (at 10%) to 0.7 (at 40%)
    return 1.0 - ((freq - 0.1) / 0.3) * 0.3;
  }

  // Rare: scale from 1.5 (at 0%) to 1.0 (at 10%)
  return 1.5 - (freq / 0.1) * 0.5;
}

/**
 * Convenience: compute a fully adjusted novelty score for a single signal.
 *
 * Combines baseline deviation with habit adjustment to produce a
 * value between 0 and 1 representing how "novel" this signal feels today.
 *
 * @param todayValue      - Today's raw value
 * @param baseline        - User's historical average
 * @param signalFrequency - Fraction of days this signal is active (0–1)
 * @returns Adjusted novelty score between 0 and 1
 */
export function computeAdjustedNovelty(
  todayValue: number,
  baseline: number,
  signalFrequency: number
): number {
  const delta = computeBaselineDelta(todayValue, baseline);
  const habitMultiplier = computeHabitAdjustment(signalFrequency);

  return Math.min(1, delta * habitMultiplier);
}
