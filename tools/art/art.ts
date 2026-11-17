// decision: FE-005 §5
// decision: docs/adr/0025-scene-figures-are-deep-modules.md
import { createHash } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createViteServer } from 'vitest/node';
import { rawTextFiles } from '../../raw-text-files.mts';
import { currentLoad } from '../load/workers.ts';
import { bakeInWorkers } from './art-bake-pool.ts';
import { bakeChunk, chunksOf, mergeChunks } from './art-chunks.pure.ts';
import { artStore } from './art-store.pure.ts';
import { cssRules } from './css-rules.pure.ts';

const ROOT = process.cwd();
// Every `<Art>` the pages render draws inline, marked for the bake (`artMode`).
process.env.ART_BUILD = '1';
// `--workers N` bakes across N threads (default: the shared idle-CPU rule); `--out DIR` writes there instead of
// `public/art`; `--only a,b` keeps the Slides of those pages (by page-name prefix), for the parallel-bake test.
const { values: args } = parseArgs({
  options: { workers: { type: 'string' }, out: { type: 'string' }, only: { type: 'string' } },
});
const workers = args.workers === undefined ? (await currentLoad()).workers : Number(args.workers);
if (!Number.isInteger(workers) || workers < 1)
  throw new Error(`--workers must be a positive whole number, got "${args.workers}"`);
const OUT = path.resolve(ROOT, args.out ?? 'public/art');
const ONLY = args.only?.split(',');
/** Slides per chunk: several chunks per worker, so one slow chunk never leaves the others idle. */
const CHUNKS_PER_WORKER = 8;
const ENTRY = '/src/episodes/components/art-build/art-pages.tsx';

interface ArtPage {
  readonly page: string;
  readonly markup: () => string;
}

/**
 * A CSS-module class as the bake reads it: the module's file name, the local name and a hash of the module's path,
 * joined by `__`, so two Slides' `slide.module.css` never share a class. The compiled text (`?inline`) is named alike.
 */
function scopedName(local: string, file: string) {
  const module = file.replace(/\?.*$/, '');
  const hash = createHash('sha256').update(path.relative(ROOT, module)).digest('hex').slice(0, 6);
  return `${path.basename(module, '.module.css')}__${local}__${hash}`;
}

const server = await createViteServer({
  configFile: false,
  root: ROOT,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false },
  plugins: [rawTextFiles()],
  resolve: { alias: { '@': path.join(ROOT, 'src') } },
  css: { modules: { generateScopedName: scopedName } },
});

async function moduleCss(): Promise<string> {
  const ids = [...server.moduleGraph.idToModuleMap.keys()].filter((id) => /\.module\.css$/.test(id));
  const texts = await Promise.all(
    ids.map(async (id) => (await server.ssrLoadModule(`${id}?inline`)).default as string),
  );
  return texts.join('\n');
}

/**
 * Every Slide's markup; a Slide that cannot render outside Next (a hero that needs its motion provider, a CommonJS
 * `next/image`) is named and skipped. A skipped Slide holding `<Art>` still fails `next build` on the missing name.
 */
function renderAll(pages: readonly ArtPage[]) {
  const rendered: { readonly page: string; readonly markup: string }[] = [];
  const skipped: string[] = [];
  for (const { page, markup } of pages) {
    try {
      rendered.push({ page, markup: markup() });
    } catch {
      skipped.push(page);
    }
  }
  if (skipped.length > 0)
    console.warn(`art: ${skipped.length} Slides render only in Next, unsearched: ${skipped.join(', ')}`);
  return rendered;
}

try {
  const { artPages } = (await server.ssrLoadModule(ENTRY)) as { artPages: () => Iterable<ArtPage> };
  const pages = [...artPages()].filter(({ page }) => ONLY === undefined || ONLY.some((id) => page.startsWith(id)));
  const rendered = renderAll(pages);
  const rules = cssRules(await moduleCss());
  const chunks = chunksOf(rendered, Math.max(1, Math.ceil(rendered.length / (workers * CHUNKS_PER_WORKER))));
  const baked =
    workers === 1 ? chunks.map((chunk) => bakeChunk(chunk, rules)) : await bakeInWorkers(chunks, rules, workers);
  const store = artStore(mergeChunks(baked));
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  for (const { file, text } of store.files) writeFileSync(path.join(OUT, file), text);
  writeFileSync(path.join(OUT, 'manifest.json'), `${JSON.stringify(store.manifest, null, 2)}\n`);
  const names = Object.keys(store.manifest).length;
  for (const reason of store.inline) console.warn(`art: kept inline, a Slide's CSS repaints it: ${reason}`);
  console.log(`art: ${store.files.length} files for ${names} names, from ${rendered.length} Slides`);
} finally {
  await server.close();
}
