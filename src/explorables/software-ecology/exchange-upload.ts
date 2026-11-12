/*
 * Upload (design-ADR 0024 §11): read a visitor's exchange file, check it against schema /5, then for stability, and
 * load it or refuse it. The page imports this module only when a file arrives, so the YAML reader and the schema stay
 * out of the first load.
 */
import { loadExchange, type SavedState, type Upload } from './exchange-load.pure.ts';
import { CATALOG } from './use-case-data.ts';
import { readExchange } from './use-case-file.ts';

export type { Upload };

/** The file's text and name, read, checked and loaded, or refused with the reasons. */
export const uploadExchange = (text: string, name: string): Upload => {
  const r = readExchange(text, Object.keys(CATALOG));
  if ('unread' in r) return { kind: 'unread', reason: r.unread };
  if ('problems' in r) return { kind: 'broken', problems: r.problems };
  return loadExchange({ ...r.ok, state: r.ok.state as SavedState }, { name, catalog: CATALOG });
};
