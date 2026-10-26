// Spec assembly: builds `spec/spec.html` from what exists in an Episode's staging folder (design-ADR 0011). `forbid`
// first fails, naming file and line, when a term survives in the staging folder (after a rename). Agents supply content
// only: the Brief, the Dossier, the designers' fragments `.scratch/<slug>/spec/*.html` and the Visual language and
// Episode page markup `visual-language.html` and `episode-page.html` beside them. The user's feedback rounds lock the
// user's picks. Compiles `spec/design.css` beside the page. Refuses an approved Spec; runs the Spec contract that
// applies to the stage (all of it once Options are present) and reports findings. Real disk; the clock is passed in.
// The entry point is `npm run episode:spec-assemble`.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findForbidden } from './episode-forbid.pure.ts';
import { assembleSpec } from './episode-spec-assemble.pure.ts';
import { SPEC_FILE } from './episode-spec-page.pure.ts';
import { checkSpec } from './episode-spec.pure.ts';
import { buildDesignCss } from './spec-css.ts';
import { utcSeconds } from './staging-file.pure.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const ASSETS = path.join(ROOT, 'skills/new-episode/assets');
const PROSE_FILES = ['visual-language.html', 'episode-page.html'];

/** What one assembly printed: lines for stdout and stderr, and whether it failed (a refusal or a finding). */
export interface SpecAssembleReport {
  out: string[];
  err: string[];
  failed: boolean;
}

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

const refused = (err: string[]): SpecAssembleReport => ({ out: [], err, failed: true });

/** What an Episode's Spec is assembled from: its staging folder, its Brief and Dossier, and the designers' scratch. */
interface Sources {
  folder: string;
  brief: string;
  dossier: string | undefined;
  scratch: string;
  fragments: string[];
}

function sourcesOf(episode: string): Sources | SpecAssembleReport {
  const folder = episode.includes('/') ? path.resolve(episode) : path.join(ROOT, 'docs/episodes', episode);
  const brief = read(path.join(folder, 'brief.md'));
  if (brief === undefined)
    return refused([`✖ ${path.relative(ROOT, folder)}/brief.md does not exist: the Spec starts from the Brief`]);
  const scratch = path.join(ROOT, '.scratch', path.basename(folder), 'spec');
  const fragmentFiles = existsSync(scratch)
    ? readdirSync(scratch)
        .filter((name) => name.endsWith('.html') && !PROSE_FILES.includes(name))
        .sort()
    : [];
  const fragments = fragmentFiles.map((name) => readFileSync(path.join(scratch, name), 'utf8'));
  return { folder, brief, dossier: read(path.join(folder, 'dossier.md')), scratch, fragments };
}

/** The forbidden terms that survive in the staging folder, one refusal line each. */
function forbiddenHits(folder: string, forbid: readonly string[] | undefined): string[] {
  if (forbid === undefined) return [];
  return findForbidden(stagingTexts(folder), forbid).map(
    ({ file, line, term }) => `✖ ${file}:${line} holds the forbidden term "${term}"`,
  );
}

function assembled(sources: Sources, reviewAsset: string, now: Date): string {
  const { folder, brief, dossier, scratch, fragments } = sources;
  return assembleSpec({
    frame: readFileSync(path.join(ASSETS, 'spec-frame.html'), 'utf8'),
    reviewAsset,
    generated: { by: 'process:spec-assemble', at: utcSeconds(now) },
    brief,
    dossier,
    fragments,
    visualLanguage: read(path.join(scratch, 'visual-language.html')),
    episodePage: read(path.join(scratch, 'episode-page.html')),
    feedback: feedbackRounds(folder),
    existing: read(path.join(folder, SPEC_FILE)),
  });
}

/** Writes the page and its design.css, then checks the Spec contract that applies to the stage reached. */
async function written(sources: Sources, reviewAsset: string, html: string): Promise<SpecAssembleReport> {
  const { folder, dossier, fragments } = sources;
  const specPath = path.join(folder, SPEC_FILE);
  mkdirSync(path.dirname(specPath), { recursive: true });
  writeFileSync(specPath, html);
  // The served design.css holds only the classes it was compiled from, so it follows every write of the page.
  await buildDesignCss(path.dirname(specPath));
  const options = fragments.length > 0;
  const stage = options ? 'Options' : dossier === undefined ? 'Brief' : 'Dossier';
  const findings = checkSpec(
    { [SPEC_FILE]: html, ...(dossier === undefined ? {} : { 'dossier.md': dossier }) },
    reviewAsset,
    options ? 'options' : 'early',
  );
  const done = `✔ ${path.relative(ROOT, specPath)} assembled to the ${stage} stage`;
  return { out: [done, ...findings.map(({ message }) => `✖ ${message}`)], err: [], failed: findings.length > 0 };
}

/** Assembles the Spec of `episode` (a slug under `docs/episodes/`, or any path with a slash) at `now`. */
export async function assembleSpecFolder(request: {
  episode: string;
  forbid: readonly string[] | undefined;
  now: Date;
}): Promise<SpecAssembleReport> {
  const sources = sourcesOf(request.episode);
  if ('failed' in sources) return sources;
  const hits = forbiddenHits(sources.folder, request.forbid);
  if (hits.length > 0) return refused(hits);
  const reviewAsset = readFileSync(path.join(ASSETS, 'spec-review.html'), 'utf8');
  let html: string;
  try {
    html = assembled(sources, reviewAsset, request.now);
  } catch (error) {
    return refused([`✖ ${error instanceof Error ? error.message : String(error)}`]);
  }
  return written(sources, reviewAsset, html);
}
