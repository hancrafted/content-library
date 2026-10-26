import { mergePrefs, parsePrefs, PREFS_KEY, type Prefs } from './prefs.pure';

/** Reads the single prefs key; storage being unavailable reads as empty prefs. */
export function readPrefs(): Prefs {
  try {
    return parsePrefs(window.localStorage.getItem(PREFS_KEY));
  } catch {
    return {};
  }
}

/** Merges `patch` into the single prefs key. */
export function writePrefs(patch: Prefs): void {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    window.localStorage.setItem(PREFS_KEY, mergePrefs(raw, patch));
  } catch {
    // Storage disabled (private mode, quota): the preference lasts for this page only.
  }
}
