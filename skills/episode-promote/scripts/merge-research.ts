// `npm run episode:merge-research -- <retired-id> <into-id>`: merges a duplicate Research question at the Promotion
// Gate, once Han has kept its card (episode-promote step 7). It re-points every citation of the retired id in
// `src/components/`, `docs/episodes/` and `docs/llm-wiki/` to the kept one, lists the retired id in the kept question's
// `supersedes` line, and deletes the retired folder. Run from the repo root, after writing the retired question's
// findings into the kept one's Answer. It refuses, and changes nothing, on an unknown id or a promoted retired id.

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { mergeResearch } from './merge-research.pure.ts';

const ROOTS = ['src/components', 'docs/episodes', 'docs/llm-wiki'];
/** The files that can hold a Research question or cite one: research files, Dossiers, plans and Slide code. */
const CITING = /\.(md|ts|tsx)$/;

const [retired, into] = process.argv.slice(2);
if (!retired || !into) {
  console.error('usage: npm run episode:merge-research -- <retired-id> <into-id>');
  process.exit(1);
}

function filesUnder(root: string): string[] {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && CITING.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

const files = Object.fromEntries(ROOTS.flatMap(filesUnder).map((file) => [file, readFileSync(file, 'utf8')]));
let merged: ReturnType<typeof mergeResearch>;
try {
  merged = mergeResearch({ retired, into, files });
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

for (const [file, text] of Object.entries(merged.writes)) writeFileSync(file, text);
for (const folder of merged.removes) rmSync(folder, { recursive: true });
execFileSync('npx', ['prettier', '--log-level', 'warn', '--write', ...Object.keys(merged.writes)], {
  stdio: 'inherit',
});
console.log(
  `merged ${retired} into ${into}: ${Object.keys(merged.writes).length} file(s) re-pointed, ${merged.removes.join(', ')} removed`,
);
