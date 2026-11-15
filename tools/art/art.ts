// `npm run art` (FE-005 §5, design-ADR 0025): renders every composed page's Slides through Vite's SSR loader, bakes
// each `<Art>` drawing with its CSS-module paint, and writes the content-hashed files and their manifest to
// `public/art/`, which `next build` copies into the export. Runs as `prebuild`; the folder is build output, ignored by git.
import { createHash } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createViteServer } from 'vitest/node';
import { rawTextFiles } from '../../raw-text-files.mts';
import { bakeArt } from './art-bake.pure.ts';
import { artStore, type ArtPiece } from './art-store.pure.ts';
import { cssRules, type CssRule } from './css-rules.pure.ts';

const ROOT = process.cwd();
// Every `<Art>` the pages render draws inline, marked for the bake (`artMode`).
process.env.ART_BUILD = '1';
const OUT = path.join(ROOT, 'public/art');
const ENTRY = '/src/episodes/components/art-build/art-pages.tsx';

/** What the entry yields for each Slide: where it comes from, and its markup on demand. */
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

/** Every CSS module the rendered pages imported, compiled, in the order the loader met them. */
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

/** Bakes every rendered Slide's drawings; every refusal is reported once, naming the first Slide it came from. */
function bakeAll(rendered: readonly { readonly page: string; readonly markup: string }[], rules: readonly CssRule[]) {
  const refusals = new Map<string, string>();
  const pieces = rendered.flatMap(({ page, markup }): ArtPiece[] => {
    try {
      return bakeArt(markup, rules).map((piece) => ({ ...piece, from: page }));
    } catch (error) {
      const message = (error as Error).message;
      if (!refusals.has(message)) refusals.set(message, page);
      return [];
    }
  });
  if (refusals.size > 0) {
    const lines = [...refusals].map(([message, page]) => `- ${page}: ${message}`);
    throw new Error(`npm run art refused ${refusals.size} drawings:\n${lines.join('\n')}`);
  }
  return pieces;
}

try {
  const { artPages } = (await server.ssrLoadModule(ENTRY)) as { artPages: () => Iterable<ArtPage> };
  const rendered = renderAll([...artPages()]);
  const store = artStore(bakeAll(rendered, cssRules(await moduleCss())));
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
