import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { promoteResearch } from '../../../src/pipeline/lib/promote-research.pure.ts';

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

const indexFile = path.join(WIKI, 'index.md');
let promoted: ReturnType<typeof promoteResearch>;
try {
  promoted = promoteResearch({
    index: readFileSync(indexFile, 'utf8'),
    glossary: readFileSync('GLOSSARY.md', 'utf8'),
    wiki,
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
const touched = [indexFile, ...promoted.moves.map(({ to }) => path.join(WIKI, to))];
execFileSync('npx', ['oxfmt', ...touched], { stdio: 'inherit' });
console.log(`moved ${promoted.moves.length} research folder(s) into ${wikiResearch}/ and listed them in ${indexFile}`);
