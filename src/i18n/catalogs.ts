import type { Locale } from '../lib/locale.pure';
import de from '../messages/de.json';
import en from '../messages/en.json';

/** English is the reference catalog: its shape is the type every locale must match. */
export type Messages = typeof en;

/** Typed against `Messages`, so a key missing from any locale fails `tsc`, not the reader. */
export const CATALOGS: Record<Locale, Messages> = { en, de };
