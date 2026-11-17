import { mergePrefs, parsePrefs, PREFS_KEY, type Prefs } from './prefs.pure';
import { mergeProgress, parseProgress, PROGRESS_KEY, type ProgressEntry } from './progress.pure';

export function readPrefs(): Prefs {
  try {
    return parsePrefs(window.localStorage.getItem(PREFS_KEY));
  } catch {
    return {};
  }
}

export function writePrefs(patch: Prefs): boolean {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    window.localStorage.setItem(PREFS_KEY, mergePrefs(raw, patch));
    return true;
  } catch {
    return false;
  }
}

export function readProgress(key: string): ProgressEntry | undefined {
  try {
    return parseProgress(window.localStorage.getItem(PROGRESS_KEY))[key];
  } catch {
    return undefined;
  }
}

export function writeProgress(key: string, entry: ProgressEntry | null): boolean {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    window.localStorage.setItem(PROGRESS_KEY, mergeProgress(raw, key, entry));
    return true;
  } catch {
    return false;
  }
}

export function removeProgress(key: string): void {
  writeProgress(key, null);
}
