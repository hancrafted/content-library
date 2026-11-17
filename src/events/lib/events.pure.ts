import type { IsoDate } from '@/content-store/schemas/fields';

// decision: docs/decision-records/0016-content-data-model.md
export function isPastEvent(date: IsoDate, buildDay: IsoDate): boolean {
  return date < buildDay;
}
