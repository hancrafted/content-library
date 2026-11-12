/*
 * The message under the toolbar after Download or Upload, as the reference build's `ioMsg`: one line, a list of at most
 * eight reasons, and whether it reports a refusal. The reasons keep the schema's `path: what is allowed` form.
 */
import { fillTemplate } from '@/shared/lib/template.pure';
import type { Upload } from './exchange-load.pure.ts';
import type { ExchangeWords } from './exchange-words.types';

export interface ExchangeMessage {
  readonly text: string;
  readonly list: readonly string[];
  readonly bad: boolean;
}

const LIST_MAX = 8;

export const downloadedMessage = (w: ExchangeWords, x: { file: string; name: string }): ExchangeMessage => ({
  text: fillTemplate(w.downloaded, x),
  list: [],
  bad: false,
});

const warnNote = (w: ExchangeWords, warn: { rush: readonly string[]; worst: readonly string[] }): string =>
  (warn.rush.length ? fillTemplate(w.rush, { who: warn.rush.join(', ') }) : '') +
  (warn.worst.length ? fillTemplate(w.worst, { who: warn.worst.join(', ') }) : '');

/** What Upload says about a file: loaded with any warnings, or refused with its reasons. */
export const uploadMessage = (w: ExchangeWords, x: { file: string; up: Upload }): ExchangeMessage => {
  const { file, up } = x;
  if (up.kind === 'unread') return { text: fillTemplate(w.unread, { file, reason: up.reason }), list: [], bad: true };
  if (up.kind !== 'loaded')
    return { text: fillTemplate(w[up.kind], { file }), list: up.problems.slice(0, LIST_MAX), bad: true };
  const counts = { file, centers: up.centers, belts: up.belts };
  return { text: fillTemplate(w.loaded, counts) + warnNote(w, up.warn), list: [], bad: false };
};
