import { z } from 'zod';

/** A kebab-case slug or id: lowercase words and digits joined by single hyphens. */
export const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** A kebab-case string field, described by what it names. */
export const slugOf = (what: string) => z.string().regex(KEBAB, 'must be kebab-case').describe(what);
