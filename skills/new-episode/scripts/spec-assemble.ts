// `npm run episode:spec-assemble -- <slug | Episode folder>`: builds `spec/spec.html` from what exists (design-ADR 0011).
// Agents supply content only: the Brief, the Dossier, the designers' fragments `.scratch/<slug>/spec/*.html` and the
// Visual language and Episode page markup `visual-language.html` and `episode-page.html` beside them. The user's feedback
// rounds lock the user's picks. Refuses an approved Spec; runs the Spec contract that applies to the stage (all of it once Options are present) and exits 1 on findings.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleSpec } from '../../../src/lib/episode-spec-assemble.pure.ts';
import { SPEC_FILE } from '../../../src/lib/episode-spec-page.pure.ts';
import { checkSpec } from '../../../src/lib/episode-spec.pure.ts';
import { utcSeconds } from '../../../src/lib/staging-file.pure.ts';

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

const [arg, ...extra] = process.argv.slice(2);
if (arg === undefined || extra.length > 0) {
  console.error('✖ usage: npm run episode:spec-assemble -- <slug | Episode folder>');
  process.exit(1);
}
const folder = arg.includes('/') ? path.resolve(arg) : path.join(ROOT, 'docs/episodes', arg);
const slug = path.basename(folder);
const brief = read(path.join(folder, 'brief.md'));
if (brief === undefined) {
  console.error(`✖ ${path.relative(ROOT, folder)}/brief.md does not exist: the Spec starts from the Brief`);
  process.exit(1);
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
const stage = fragments.length > 0 ? 'Options' : dossier === undefined ? 'Brief' : 'Dossier';
console.log(`✔ ${path.relative(ROOT, specPath)} assembled to the ${stage} stage`);
const findings = checkSpec(
  { [SPEC_FILE]: html, ...(dossier === undefined ? {} : { 'dossier.md': dossier }) },
  reviewAsset,
  fragments.length > 0 ? 'options' : 'early',
);
for (const { message } of findings) console.log(`✖ ${message}`);
process.exit(findings.length > 0 ? 1 : 0);
