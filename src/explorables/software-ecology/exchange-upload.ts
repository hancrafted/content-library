// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { loadExchange, type SavedState, type Upload } from './exchange-load.pure.ts';
import { CATALOG } from './use-case-data.ts';
import { readExchange } from './use-case-file.ts';

export type { Upload };

export const uploadExchange = (text: string, name: string): Upload => {
  const r = readExchange(text, Object.keys(CATALOG));
  if ('unread' in r) return { kind: 'unread', reason: r.unread };
  if ('problems' in r) return { kind: 'broken', problems: r.problems };
  return loadExchange({ ...r.ok, state: r.ok.state as SavedState }, { name, catalog: CATALOG });
};
