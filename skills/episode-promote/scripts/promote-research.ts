// `npm run episode:promote-research -- docs/episodes/<staging-folder>`: moves every research folder the Run staged
// into `docs/llm-wiki/research/<category>/`, lists it in `docs/llm-wiki/index.md`, replaces the wiki question a planned
// refresh rewrote, and moves each staged Concept into `docs/llm-wiki/concepts/` (episode-promote step 7). Run from the
// repo root, before Staging is deleted. It refuses, and changes nothing, on any problem `promote-research.pure.ts`
// names: among them a question whose confidence Han has not confirmed and a staged Concept he has not accepted.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { promoteResearch, type Promotion } from './promote-research.pure.ts';

const WIKI = 'docs/llm-wiki';
const staging = process.argv[2]?.replace(/\/$/, '');
if (!staging || !existsSync(staging)) {
  console.error('usage: npm run episode:promote-research -- docs/episodes/<staging-folder>');
  process.exit(1);
}

function subfolders(folder: string): string[] {
  return existsSync(folder)
    ? readdirSync(folder, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : [];
}

const root = path.join(staging, 'research');
const research: Record<string, string | null> = {};
for (const folder of subfolders(root)) {
  const file = path.join(root, folder, 'research.md');
  research[folder] = existsSync(file) ? readFileSync(file, 'utf8') : null;
}
const wikiResearch = path.join(WIKI, 'research');
const wiki = subfolders(wikiResearch).flatMap((category) =>
  subfolders(path.join(wikiResearch, category)).map((folder) => `${wikiResearch}/${category}/${folder}`),
);

const conceptRoot = path.join(staging, 'concepts');
const stagedConcepts: Record<string, string | null> = {};
for (const id of subfolders(conceptRoot)) {
  const file = path.join(conceptRoot, id, 'concept.md');
  stagedConcepts[id] = existsSync(file) ? readFileSync(file, 'utf8') : null;
}
const planFile = path.join(staging, 'research-plan.md');

const indexFile = path.join(WIKI, 'index.md');
let promoted: Promotion;
try {
  promoted = promoteResearch({
    index: readFileSync(indexFile, 'utf8'),
    glossary: readFileSync('GLOSSARY.md', 'utf8'),
    wiki,
    research,
    staging,
    plan: existsSync(planFile) ? readFileSync(planFile, 'utf8') : null,
    concepts: subfolders(path.join(WIKI, 'concepts')),
    stagedConcepts,
  });
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

for (const replaced of promoted.removes) rmSync(path.join(WIKI, replaced), { recursive: true });
for (const { folder, to } of promoted.moves) {
  mkdirSync(path.dirname(path.join(WIKI, to)), { recursive: true });
  renameSync(path.join(root, folder), path.join(WIKI, to));
}
for (const id of promoted.concepts) renameSync(path.join(conceptRoot, id), path.join(WIKI, 'concepts', id));
writeFileSync(indexFile, promoted.index);
// Staging is not formatted; the wiki is, so the moved files take its format here.
const touched = [
  indexFile,
  ...promoted.moves.map(({ to }) => path.join(WIKI, to)),
  ...promoted.concepts.map((id) => path.join(WIKI, 'concepts', id)),
];
execFileSync('npx', ['prettier', '--log-level', 'warn', '--write', ...touched], { stdio: 'inherit' });
console.log(`moved ${promoted.moves.length} research folder(s) into ${wikiResearch}/ and listed them in ${indexFile}`);
// Each promoted id gets a page only once it is listed; `npm run verify` names any id missing from these lists.
const replacedIds = promoted.removes.map((replaced) => (replaced.split('/').at(-1) ?? '').split('__')[0]);
const ids = promoted.moves.map(({ folder }) => folder.split('__')[0]).filter((id) => !replacedIds.includes(id));
if (ids.length > 0) console.log(`add to RESEARCH_IDS in src/lib/research-ids.ts: ${ids.join(', ')}`);
if (promoted.concepts.length > 0)
  console.log(`add to CONCEPT_IDS in src/lib/routes.ts: ${promoted.concepts.join(', ')}`);
