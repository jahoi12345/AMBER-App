import type { ScoreBreakdown, SignalSet, TimeTextureResult } from "./types";
import { normalizeSignals } from "./signalNormalizer";
import { getTextureState } from "./textureStates";

const WEIGHTS = {
  movement: 0.24,
  novelty: 0.30,
  engagement: 0.28,
  memory: 0.18,
} as const;

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function scoreTimeTexture(signals: SignalSet): TimeTextureResult {
  const normalized = normalizeSignals(signals);

  const breakdown: ScoreBreakdown = {
    movement: normalized.movement * WEIGHTS.movement,
    novelty: normalized.novelty * WEIGHTS.novelty,
    engagement: normalized.engagement * WEIGHTS.engagement,
    memory: normalized.memory * WEIGHTS.memory,
  };

  const weightedTotal =
    breakdown.movement +
    breakdown.novelty +
    breakdown.engagement +
    breakdown.memory;

  const strongDimensions = [
    normalized.movement,
    normalized.novelty,
    normalized.engagement,
    normalized.memory,
  ].filter((value) => value >= 55).length;

  const gentleBaselineLift = 8;
  const balanceBonus = strongDimensions >= 3 ? 6 : strongDimensions === 2 ? 3 : 0;
  const reflectionBonus = signals.reflections > 0 ? 2 : 0;
  const noveltyBonus = signals.newActivities > 0 ? 3 : 0;

  const score = clamp(
    Math.round(weightedTotal + gentleBaselineLift + balanceBonus + reflectionBonus + noveltyBonus),
  );

  const state = getTextureState(score);

  return {
    score,
    state,
    breakdown,
  };
}