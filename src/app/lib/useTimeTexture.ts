/**
 * useTimeTexture Hook
 *
 * Reads from the debug context and computes the Time Texture score
 * for the currently selected person and date.
 *
 * Falls back to default hardcoded signals when no CSV data is available.
 */

import { useMemo } from "react";
import { useDebug } from "./debugContext";
import { scoreTimeTexture } from "./timeTexture/scoreTimeTexture";
import type { SignalSet, TimeTextureResult } from "./timeTexture/types";

const DEFAULT_SIGNALS: SignalSet = {
  steps: 2396,
  heartRateActivity: 40,
  timeOutside: 32,
  gamesPlayed: 2,
  newActivities: 1,
  messagesSent: 5,
  inPersonInteractions: 1,
  reflections: 1,
};

interface UseTimeTextureResult extends TimeTextureResult {
  /** The raw signals used for scoring */
  signals: SignalSet;
  /** The 14-day baseline for comparison */
  baseline: SignalSet | null;
  /** Week-level signals for terrain visualization */
  weekSignals: { date: string; signals: SignalSet }[];
  /** The person's display name */
  personName: string;
  /** The selected date */
  date: string;
}

export function useTimeTexture(): UseTimeTextureResult {
  const {
    currentSignals,
    currentBaseline,
    weekSignals,
    currentPerson,
    selectedDate,
  } = useDebug();

  const signals = currentSignals ?? DEFAULT_SIGNALS;

  const result = useMemo(() => scoreTimeTexture(signals), [signals]);

  return {
    ...result,
    signals,
    baseline: currentBaseline,
    weekSignals,
    personName: currentPerson?.name ?? "Anne",
    date: selectedDate,
  };
}
