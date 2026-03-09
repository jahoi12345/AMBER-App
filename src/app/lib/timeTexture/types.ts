/**
 * Time Texture Scoring — Shared Type Definitions
 *
 * These types power Amber's core scoring system, which translates
 * daily behavioral signals into a "time texture" score (0–100).
 */

/** The four qualitative states a day can occupy */
export type TextureState = "compressed" | "steady" | "expanding" | "vivid";

/**
 * Raw behavioral signals collected from the user's day.
 * Each field maps to a sensor or interaction the app tracks.
 */
export interface SignalSet {
  /** Daily step count from pedometer / health kit */
  steps: number;
  /** Minutes of elevated heart rate activity */
  heartRateActivity: number;
  /** Minutes spent outside (GPS / light sensor proxy) */
  timeOutside: number;
  /** Number of in-app games completed (word search, trivia, etc.) */
  gamesPlayed: number;
  /** Count of activities the user has never or rarely done */
  newActivities: number;
  /** Messages sent to family or friends */
  messagesSent: number;
  /** Face-to-face interactions detected or logged */
  inPersonInteractions: number;
  /** Reflections, journal entries, or memory anchors recorded */
  reflections: number;
}

/**
 * Normalized signal dimensions (each 0–100).
 * These are the intermediate values before weighted scoring.
 */
export interface NormalizedSignals {
  /** Physical movement composite (steps + heart rate + outdoor time) */
  movement: number;
  /** Novelty composite (new activities, baseline-adjusted) */
  novelty: number;
  /** Engagement composite (games, messages, interactions, reflections) */
  engagement: number;
  /** Memory richness (reflections and novel experiences that form anchors) */
  memory: number;
}

/**
 * Per-dimension contribution to the final score.
 * Each value is the weighted contribution (not the raw normalized value).
 */
export interface ScoreBreakdown {
  movement: number;
  novelty: number;
  engagement: number;
  memory: number;
}

/**
 * The complete result returned by the scoring algorithm.
 */
export interface TimeTextureResult {
  /** Final score clamped to 0–100 */
  score: number;
  /** Qualitative texture state derived from the score */
  state: TextureState;
  /** Per-dimension breakdown showing each contribution */
  breakdown: ScoreBreakdown;
}
