import type { IsoDate } from '../content-store/schemas/fields';

/**
 * The day this build runs, in UTC: the static export renders every page once, so a page's "today" is its build day.
 * It decides whether an Event is past (design-ADR 0016, Past Event); a page is as fresh as the last deploy. Read only
 * by page components; pure code takes the day as an argument.
 */
export const BUILD_DAY: IsoDate = new Date().toISOString().slice(0, 10);
