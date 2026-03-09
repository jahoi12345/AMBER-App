/**
 * Signal Normalizer
 *
 * More forgiving normalization designed to produce healthier variation
 * with the current Amber demo data. The goal is not to inflate every day,
 * but to avoid routine, moderate days being over-penalized.
 */

import type { NormalizedSignals, SignalSet } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function curve01(value: number): number {
  const clamped = clamp(value, 0, 1);
  return 1 - Math.pow(1 - clamped, 1.6);
}

function toPercent(value: number): number {
  return Math.round(clamp(value, 0, 1) * 100);
}

export function normalizeMovement(signals: SignalSet): number {
  const stepRatio = curve01(signals.steps / 2800);
  const hrRatio = curve01(signals.heartRateActivity / 35);
  const outsideRatio = curve01(signals.timeOutside / 28);

  const score = stepRatio * 0.42 + hrRatio * 0.24 + outsideRatio * 0.34;
  return toPercent(score);
}

export function normalizeNovelty(signals: SignalSet): number {
  const n = signals.newActivities;

  if (n <= 0) return 18;
  if (n === 1) return 58;
  if (n === 2) return 76;
  if (n === 3) return 89;

  return clamp(89 + (n - 3) * 4, 89, 100);
}

export function normalizeEngagement(signals: SignalSet): number {
  const gameScore = curve01(signals.gamesPlayed / 2);
  const messageScore = curve01(signals.messagesSent / 5);
  const inPersonScore = curve01(signals.inPersonInteractions / 1.5);
  const reflectionScore = curve01(signals.reflections / 1.5);

  const score =
    gameScore * 0.18 +
    messageScore * 0.24 +
    inPersonScore * 0.34 +
    reflectionScore * 0.24;

  return toPercent(score);
}

export function normalizeMemory(signals: SignalSet): number {
  const reflectionScore = curve01(signals.reflections / 1.2);
  const noveltyMemory = curve01(signals.newActivities / 1.5);
  const outsideMemory = curve01(signals.timeOutside / 20);

  const score =
    reflectionScore * 0.5 +
    noveltyMemory * 0.35 +
    outsideMemory * 0.15;

  return toPercent(score);
}

export function normalizeSignals(signals: SignalSet): NormalizedSignals {
  return {
    movement: normalizeMovement(signals),
    novelty: normalizeNovelty(signals),
    engagement: normalizeEngagement(signals),
    memory: normalizeMemory(signals),
  };
}