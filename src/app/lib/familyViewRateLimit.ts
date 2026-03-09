/**
 * Family View Rate Limit — Human rate-limiting for Edge Case 01
 *
 * Tracks how many times the family view (dashboard) is opened per calendar day.
 * After 2 opens in the same day, we show a gentle nudge so the view doesn’t
 * become a surveillance tool.
 *
 * WHEN THE "SOMETIMES A QUIET DAY..." BANNER SHOWS:
 * - We count each time FamilyHome or FamilyStats mounts (each "open" of the
 *   family dashboard).
 * - Count is stored in localStorage (amber-family-view-opens) as
 *   { date: "YYYY-MM-DD", count: number }.
 * - The banner appears when count > 2 for the current calendar day (i.e. on
 *   the 3rd open and every open after that, same day).
 * - At midnight (new calendar day) the count resets; the banner won’t show
 *   again until the family member has opened the view more than 2 times that day.
 */

const STORAGE_KEY = "amber-family-view-opens";
const OPENS_THRESHOLD = 2;
/** Min ms between increments so one visit is not counted twice (e.g. double mount in dev). */
const INCREMENT_COOLDOWN_MS = 2000;

/** Use local calendar date so "today" matches the user's day; resets at local midnight. */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface FamilyViewOpenState {
  date: string;
  count: number;
}

interface StoredState {
  date: string;
  count: number;
  lastIncrementAt?: number;
}

function readState(): FamilyViewOpenState {
  if (typeof window === "undefined") {
    return { date: "", count: 0 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const todayStr = today();
    if (!raw) return { date: todayStr, count: 0 };
    const parsed = JSON.parse(raw) as StoredState;
    if (parsed.date !== todayStr) {
      const reset: StoredState = { date: todayStr, count: 0 };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      return { date: todayStr, count: 0 };
    }
    const count = typeof parsed.count === "number" ? parsed.count : 0;
    if (parsed.lastIncrementAt == null) {
      const reset: StoredState = { date: todayStr, count: 0 };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      return { date: todayStr, count: 0 };
    }
    return { date: parsed.date, count };
  } catch {
    return { date: "", count: 0 };
  }
}

function writeState(state: StoredState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/**
 * Returns the current open count for today. Resets if the stored date
 * is not today.
 */
export function getFamilyViewOpenCount(): FamilyViewOpenState {
  return readState();
}

/**
 * Increments the family view open count for today. If the stored date
 * is not today, resets to 1. Within the same day, only increments when
 * at least INCREMENT_COOLDOWN_MS has passed since the last increment
 * (so one visit is not counted twice). Returns the current count after this call.
 */
export function incrementFamilyViewOpenCount(): number {
  const todayStr = today();
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    if (!raw) {
      writeState({ date: todayStr, count: 1, lastIncrementAt: now });
      return 1;
    }
    const parsed = JSON.parse(raw) as StoredState;
    if (parsed.date !== todayStr) {
      writeState({ date: todayStr, count: 1, lastIncrementAt: now });
      return 1;
    }
    const lastAt = parsed.lastIncrementAt ?? 0;
    if (now - lastAt < INCREMENT_COOLDOWN_MS) {
      return parsed.count;
    }
    const newCount = parsed.count + 1;
    writeState({ date: todayStr, count: newCount, lastIncrementAt: now });
    return newCount;
  } catch {
    return 0;
  }
}

/**
 * True when the family view has been opened more than OPENS_THRESHOLD (2)
 * times today. Used to show the gentle “Sometimes a quiet day is just a
 * quiet day” note.
 */
export function shouldShowFamilyViewRateLimitNote(): boolean {
  const state = readState();
  if (state.date !== today()) return false;
  return state.count > OPENS_THRESHOLD;
}
