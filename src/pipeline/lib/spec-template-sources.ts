// The files the Spec template is generated from, read off disk for `templateHash` (episode-spec-template-fresh.pure.ts,
// which says which files count and why). The disk reader of the freshness test and `npm run episode:spec-template-hash`.

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type TemplateSources } from './episode-spec-template-fresh.pure.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SKILL = path.join(ROOT, 'skills/to-decision-html');

/** The Spec template asset, which records the hash. */
export const TEMPLATE_FILE = path.join(ROOT, 'skills/new-episode/assets/spec-template.html');

/** `SKILL.md` and every file under `references/`, keyed by path relative to the skill folder, plus the calibration. */
export function readTemplateSources(): TemplateSources {
  const references = readdirSync(path.join(SKILL, 'references'), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(SKILL, path.join(entry.parentPath, entry.name)).replaceAll(path.sep, '/'));
  const skill = Object.fromEntries(
    ['SKILL.md', ...references].map((file) => [file, readFileSync(path.join(SKILL, file), 'utf8')]),
  );
  const calibration = readFileSync(path.join(ROOT, 'skills/new-episode/references/spec-calibration.md'), 'utf8');
  return { skill, calibration };
}
