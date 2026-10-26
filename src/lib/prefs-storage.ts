import { mergePrefs, parsePrefs, PREFS_KEY, type Prefs } from './prefs.pure';
import { mergeProgress, parseProgress, PROGRESS_KEY, type ProgressEntry } from './progress.pure';

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

/** The stored entry of one hands-on, if there is a valid one; storage being unavailable reads as none. */
export function readProgress(key: string): ProgressEntry | undefined {
  try {
    return parseProgress(window.localStorage.getItem(PROGRESS_KEY))[key];
  } catch {
    return undefined;
  }
}

/** Sets one hands-on's entry under the single progress key, the others kept. False when storage refused (quota, private mode). */
export function writeProgress(key: string, entry: ProgressEntry | null): boolean {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    window.localStorage.setItem(PROGRESS_KEY, mergeProgress(raw, key, entry));
    return true;
  } catch {
    return false;
  }
}

/** Forgets one hands-on's entry. */
export function removeProgress(key: string): void {
  writeProgress(key, null);
}
