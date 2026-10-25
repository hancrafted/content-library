import type { IsoDate } from './episode-metadata.pure';

/**
 * The day this build runs, in UTC: the static export renders every page once, so a page's "today" is its build day.
 * It decides whether an Event is past (design-ADR 0016, Past Event); a past Event lacks its notice until the next
 * deploy, accepted there. Read only by page components; pure code takes the day as an argument.
 */
export const BUILD_DAY = new Date().toISOString().slice(0, 10) as IsoDate;
