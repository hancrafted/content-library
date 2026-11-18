import { readFileSync } from 'node:fs';
import path from 'node:path';
import { mergeOverride } from '../../shared/lib/override-merge.pure.ts';
import type { Locale, TextLayers } from './episode-outline.ts';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export function layeredText(root: string, layers: TextLayers, locale: Locale): Record<string, unknown> {
  return layers[locale].reduce<Record<string, unknown>>(
    (text, file) => mergeOverride(text, JSON.parse(readFileSync(path.join(root, file), 'utf8'))),
    {},
  );
}
