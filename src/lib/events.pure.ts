import type { IsoDate } from '../content-store/schemas/fields';

/**
 * Whether an Event is past: its date lies before the build day (design-ADR 0016, Past Event). Derived, never stored;
 * an Event built on its own day is still upcoming. ISO days compare as strings.
 */
export function isPastEvent(date: IsoDate, buildDay: IsoDate): boolean {
  return date < buildDay;
}
