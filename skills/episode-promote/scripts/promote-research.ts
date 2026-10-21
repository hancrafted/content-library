// `npm run episode:promote-research -- docs/episodes/<staging-folder>`: moves every research folder the Run staged
// into `docs/llm-wiki/research/<category>/` and lists it in `docs/llm-wiki/index.md` (episode-promote step 7). Run
// from the repo root, before Staging is deleted. It refuses, and changes nothing, when a folder is already in the
// wiki or its category is not in GLOSSARY.md.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { promoteResearch } from './promote-research.pure.ts';

const WIKI = 'docs/llm-wiki';
const staging = process.argv[2]?.replace(/\/$/, '');
if (!staging || !existsSync(staging)) {
  console.error('usage: npm run episode:promote-research -- docs/episodes/<staging-folder>');
  process.exit(1);
}

const root = path.join(staging, 'research');
const research: Record<string, string> = {};
for (const folder of existsSync(root) ? readdirSync(root) : []) {
  const file = path.join(root, folder, 'research.md');
  if (existsSync(file)) research[folder] = readFileSync(file, 'utf8');
}

const indexFile = path.join(WIKI, 'index.md');
let promoted: ReturnType<typeof promoteResearch>;
try {
  promoted = promoteResearch({
    index: readFileSync(indexFile, 'utf8'),
    glossary: readFileSync('GLOSSARY.md', 'utf8'),
    research,
  });
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

for (const { folder, to } of promoted.moves) {
  mkdirSync(path.dirname(path.join(WIKI, to)), { recursive: true });
  renameSync(path.join(root, folder), path.join(WIKI, to));
}
writeFileSync(indexFile, promoted.index);
// Staging is not formatted; the wiki is, so the moved files take its format here.
execFileSync('npx', ['prettier', '--log-level', 'warn', '--write', WIKI], { stdio: 'inherit' });
console.log(`moved ${promoted.moves.length} research folder(s) into ${WIKI}/research/ and listed them in ${indexFile}`);
