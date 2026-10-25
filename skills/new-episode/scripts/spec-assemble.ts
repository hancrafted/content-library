// `npm run episode:spec-assemble -- <slug | Episode folder>`: builds `spec/spec.html` from what exists (design-ADR 0011).
// `--forbid <word,word…>` first fails, naming file and line, when a term survives in the staging folder (after a rename).
// Agents supply content only: the Brief, the Dossier, the Slide plan, the designers' fragments `.scratch/<slug>/spec/*.html` and the
// Visual language and Episode page markup `visual-language.html` and `episode-page.html` beside them. The user's feedback
// rounds lock the user's picks. Compiles `spec/design.css` beside the page. Refuses an approved Spec; runs the Spec contract that applies to the stage (all of it once Options are present) and exits 1 on findings.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findForbidden, parseSpecAssembleArgs } from '../../../src/lib/episode-forbid.pure.ts';
import { assembleSpec } from '../../../src/lib/episode-spec-assemble.pure.ts';
import { SPEC_FILE } from '../../../src/lib/episode-spec-page.pure.ts';
import { checkSpec } from '../../../src/lib/episode-spec.pure.ts';
import { utcSeconds } from '../../../src/lib/staging-file.pure.ts';
import { buildDesignCss } from './spec-css.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PROSE_FILES = ['visual-language.html', 'episode-page.html'];

const read = (file: string): string | undefined => (existsSync(file) ? readFileSync(file, 'utf8') : undefined);

/** The feedback rounds' files, oldest first by round number. */
function feedbackRounds(folder: string): string[] {
  const dir = path.join(folder, 'feedback');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => /^\d+$/.test(name))
    .sort((a, b) => Number(a) - Number(b))
    .flatMap((name) => read(path.join(dir, name, 'feedback.md')) ?? []);
}

/** The staging folder's prose and markup, by path relative to it. Feedback, the log and the generated Spec hold old terms by design. */
function stagingTexts(dir: string, base = dir): Record<string, string> {
  return Object.fromEntries(
    readdirSync(dir, { withFileTypes: true }).flatMap((entry): [string, string][] => {
      const full = path.join(dir, entry.name);
      const rel = path.relative(base, full);
      if (entry.isDirectory()) {
        return ['feedback', 'spec', 'reference'].includes(rel) ? [] : Object.entries(stagingTexts(full, base));
      }
      return /\.(md|html)$/.test(entry.name) && entry.name !== 'run-log.md' ? [[rel, readFileSync(full, 'utf8')]] : [];
    }),
  );
}

const parsed = parseSpecAssembleArgs(process.argv.slice(2));
if ('error' in parsed) {
  console.error(`✖ ${parsed.error}`);
  process.exit(1);
}
const arg = parsed.episode;
const folder = arg.includes('/') ? path.resolve(arg) : path.join(ROOT, 'docs/episodes', arg);
const slug = path.basename(folder);
const brief = read(path.join(folder, 'brief.md'));
if (brief === undefined) {
  console.error(`✖ ${path.relative(ROOT, folder)}/brief.md does not exist: the Spec starts from the Brief`);
  process.exit(1);
}
if (parsed.forbid !== undefined) {
  const hits = findForbidden(stagingTexts(folder), parsed.forbid);
  for (const { file, line, term } of hits) console.error(`✖ ${file}:${line} holds the forbidden term "${term}"`);
  if (hits.length > 0) process.exit(1);
}
const scratch = path.join(ROOT, '.scratch', slug, 'spec');
const fragmentFiles = existsSync(scratch)
  ? readdirSync(scratch)
      .filter((name) => name.endsWith('.html') && !PROSE_FILES.includes(name))
      .sort()
  : [];
const fragments = fragmentFiles.map((name) => readFileSync(path.join(scratch, name), 'utf8'));
const assets = path.join(ROOT, 'skills/new-episode/assets');
const reviewAsset = readFileSync(path.join(assets, 'spec-review.html'), 'utf8');
const dossier = read(path.join(folder, 'dossier.md'));
const specPath = path.join(folder, SPEC_FILE);
let html: string;
try {
  html = assembleSpec({
    frame: readFileSync(path.join(assets, 'spec-frame.html'), 'utf8'),
    reviewAsset,
    generated: { by: 'process:spec-assemble', at: utcSeconds(new Date()) },
    brief,
    dossier,
    slidePlan: read(path.join(folder, 'slide-plan.md')),
    fragments,
    visualLanguage: read(path.join(scratch, 'visual-language.html')),
    episodePage: read(path.join(scratch, 'episode-page.html')),
    feedback: feedbackRounds(folder),
    existing: read(specPath),
  });
} catch (error) {
  console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
mkdirSync(path.dirname(specPath), { recursive: true });
writeFileSync(specPath, html);
// The served design.css holds only the classes it was compiled from, so it follows every write of the page.
await buildDesignCss(path.dirname(specPath));
const stage = fragments.length > 0 ? 'Options' : dossier === undefined ? 'Brief' : 'Dossier';
console.log(`✔ ${path.relative(ROOT, specPath)} assembled to the ${stage} stage`);
const findings = checkSpec(
  { [SPEC_FILE]: html, ...(dossier === undefined ? {} : { 'dossier.md': dossier }) },
  reviewAsset,
  fragments.length > 0 ? 'options' : 'early',
);
for (const { message } of findings) console.log(`✖ ${message}`);
process.exit(findings.length > 0 ? 1 : 0);
