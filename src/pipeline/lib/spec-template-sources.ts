import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type TemplateSources } from './episode-spec-template-fresh.pure.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SKILL = path.join(ROOT, 'skills/to-decision-html');

export const TEMPLATE_FILE = path.join(ROOT, 'skills/new-episode/assets/spec-template.html');

const SKILL_FOLDERS = ['references', 'assets'];

function filesUnder(folder: string): string[] {
  return readdirSync(path.join(SKILL, folder), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(SKILL, path.join(entry.parentPath, entry.name)).replaceAll(path.sep, '/'));
}

export function readTemplateSources(): TemplateSources {
  const files = ['SKILL.md', ...SKILL_FOLDERS.flatMap(filesUnder)];
  const skill = Object.fromEntries(files.map((file) => [file, readFileSync(path.join(SKILL, file), 'utf8')]));
  const calibration = readFileSync(path.join(ROOT, 'skills/new-episode/references/spec-calibration.md'), 'utf8');
  return { skill, calibration };
}
