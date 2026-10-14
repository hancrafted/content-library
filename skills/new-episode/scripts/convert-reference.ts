// `npm run convert-reference -- <pdf> <out-dir> --title <title>`: converts a PDF brought in as an Episode design reference
// into <out-dir>/design-reference.md, with every page rendered whole to pages/ and marker's larger cut-outs to
// crops/, each at most 1568 px on its longer edge. Text comes from marker (`marker_single`), which OCRs
// image-only pages through surya: by default on a llama.cpp `llama-server` marker starts itself; with
// SURYA_INFERENCE_URL set, on that server instead (see references/convert-references.md for oMLX).
import { execFileSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { cropName, keepsCrop, pageImage, renderReference } from './convert-reference.pure.ts';

const MAX_EDGE = 1568;
const JPEG_QUALITY = '80';
const USAGE = '✖ usage: npm run convert-reference -- <pdf> <out-dir> --title <title>';

const TOOLS: Record<string, string> = {
  marker_single: 'uv tool install marker-pdf, then brew install llama.cpp',
  pdftoppm: 'brew install poppler',
  pdfinfo: 'brew install poppler',
  magick: 'brew install imagemagick',
};

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function parseArgs(argv: readonly string[]): { pdf: string; out: string; title: string } {
  const at = argv.indexOf('--title');
  const title = at === -1 ? undefined : argv[at + 1];
  const positional = argv.filter((_, index) => index !== at && index !== at + 1);
  if (positional.length !== 2 || title === undefined || title === '') fail(USAGE.slice(2));
  return { pdf: positional[0], out: positional[1], title };
}

function which(tool: string): string | null {
  const found = spawnSync('which', [tool], { encoding: 'utf8' });
  return found.status === 0 ? found.stdout.trim() : null;
}

/** marker's version from the dist-info beside its executable, as an OKF actor. */
function markerActor(binary: string): string {
  const root = path.resolve(path.dirname(realpathSync(binary)), '..', 'lib');
  const python = existsSync(root) ? readdirSync(root).find((name) => name.startsWith('python')) : undefined;
  const sitePackages = python === undefined ? null : path.join(root, python, 'site-packages');
  const info =
    sitePackages === null
      ? undefined
      : readdirSync(sitePackages).find((name) => /^marker_pdf-.+\.dist-info$/.test(name));
  const version = info === undefined ? 'unknown' : info.replace(/^marker_pdf-(.+)\.dist-info$/, '$1');
  return `marker/${version}`;
}

function imageSize(file: string): { width: number; height: number } {
  const [width, height] = execFileSync('magick', ['identify', '-format', '%w %h', `${file}[0]`], { encoding: 'utf8' })
    .trim()
    .split(' ')
    .map(Number);
  return { width, height };
}

function shrink(from: string, to: string): void {
  execFileSync('magick', [from, '-resize', `${MAX_EDGE}x${MAX_EDGE}>`, '-quality', JPEG_QUALITY, to]);
}

const { pdf, out, title } = parseArgs(process.argv.slice(2));
if (!existsSync(pdf)) fail(`${pdf} does not exist.`);
if (path.extname(pdf).toLowerCase() !== '.pdf')
  fail(`${pdf} is not a PDF: export it to PDF first, since the page images come from the PDF.`);
const missing = Object.keys(TOOLS).filter((tool) => which(tool) === null);
if (missing.length > 0) fail(`missing ${missing.map((tool) => `${tool} (${TOOLS[tool]})`).join(', ')}.`);
const markerBinary = which('marker_single') as string;

const work = mkdtempSync(path.join(tmpdir(), 'convert-reference-'));
try {
  console.log(`… marker on ${pdf} (about 7 s a page with OCR)`);
  const marker = spawnSync('marker_single', [pdf, '--paginate_output', '--output_dir', work], { encoding: 'utf8' });
  if (marker.status !== 0)
    fail(`marker_single exited ${marker.status}:\n${(marker.stderr ?? '').split('\n').slice(-15).join('\n')}`);
  const stem = path.basename(pdf, path.extname(pdf));
  const markerDir = path.join(work, stem);
  const markdown = readFileSync(path.join(markerDir, `${stem}.md`), 'utf8');

  const pageCount = Number(/^Pages:\s+(\d+)/m.exec(execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }))?.[1]);
  if (!Number.isInteger(pageCount) || pageCount < 1) fail(`pdfinfo reports no page count for ${pdf}.`);
  for (const stale of ['pages', 'crops', 'design-reference.md'])
    rmSync(path.join(out, stale), { recursive: true, force: true });
  mkdirSync(path.join(out, 'pages'), { recursive: true });
  mkdirSync(path.join(out, 'crops'), { recursive: true });

  const rendered = path.join(work, 'pages');
  mkdirSync(rendered);
  execFileSync('pdftoppm', [
    '-scale-to',
    String(MAX_EDGE),
    '-jpeg',
    '-jpegopt',
    `quality=${JPEG_QUALITY}`,
    pdf,
    path.join(rendered, 'p'),
  ]);
  const renders = readdirSync(rendered).sort();
  if (renders.length !== pageCount) fail(`pdftoppm rendered ${renders.length} pages, but pdfinfo counts ${pageCount}.`);
  renders.forEach((file, index) => {
    copyFileSync(path.join(rendered, file), path.join(out, pageImage(index + 1, pageCount)));
  });

  const crops: Record<string, string | null> = {};
  for (const file of readdirSync(markerDir)) {
    const kept = cropName(file, pageCount);
    if (kept === null) continue;
    const from = path.join(markerDir, file);
    const keep = keepsCrop(imageSize(from));
    crops[file] = keep ? kept : null;
    if (keep) shrink(from, path.join(out, 'crops', kept));
  }

  const reference = path.join(out, 'design-reference.md');
  writeFileSync(
    reference,
    renderReference({
      markdown,
      title,
      generatedBy: markerActor(markerBinary),
      generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      source: { resource: path.relative(process.cwd(), path.resolve(pdf)), title: path.basename(pdf) },
      pageCount,
      crops,
    }),
  );
  execFileSync('npx', ['prettier', '--write', '--log-level', 'warn', reference], { stdio: 'inherit' });
  const kept = Object.values(crops).filter((name) => name !== null).length;
  console.log(
    `✔ ${reference}: ${pageCount} pages, ${renders.length} page images, ${kept} of ${Object.keys(crops).length} cut-outs kept`,
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
