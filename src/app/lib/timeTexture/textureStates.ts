/**
 * Texture State Constants & Helpers
 *
 * Maps numeric scores to qualitative texture states,
 * with associated labels, emoji, and icon representations.
 */

import type { TextureState } from "./types";
import { Cloud, Circle, Sun, Sparkles } from "lucide-react";

/**
 * Score thresholds that define each texture state.
 * The score must be >= the lower bound to enter that state.
 */
export const TEXTURE_THRESHOLDS: { min: number; max: number; state: TextureState }[] = [
  { min: 0, max: 35, state: "compressed" },
  { min: 35, max: 55, state: "steady" },
  { min: 55, max: 75, state: "expanding" },
  { min: 75, max: 100, state: "vivid" },
];

/**
 * Emoji representations for each texture state.
 */
export const TEXTURE_EMOJIS: Record<TextureState, string> = {
  compressed: "☁️",
  steady: "🌤️",
  expanding: "✨",
  vivid: "☀️",
};

/**
 * Human-readable labels for each texture state.
 */
export const TEXTURE_LABELS: Record<TextureState, string> = {
  compressed: "Compressed",
  steady: "Steady",
  expanding: "Expanding",
  vivid: "Vivid",
};

/**
 * Icon representations for each texture state.
 * These are used in UI components like the Time Texture score card.
 */
export const TEXTURE_ICONS = {
  compressed: Cloud,
  steady: Circle,
  expanding: Sun,
  vivid: Sparkles,
};

/**
 * Determine the qualitative texture state from a numeric score.
 *
 * @param score - A value between 0 and 100
 * @returns The corresponding TextureState
 */
export function getTextureState(score: number): TextureState {
  const clamped = Math.max(0, Math.min(100, score));

  for (let i = TEXTURE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (clamped >= TEXTURE_THRESHOLDS[i].min) {
      return TEXTURE_THRESHOLDS[i].state;
    }
  }

  // Fallback (should never occur)
  return "compressed";
}