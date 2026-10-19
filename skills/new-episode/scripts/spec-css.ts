// The Spec's design.css: the site's globals.css through Tailwind, scanning one folder for classes, so the page renders
// with the real tokens and only the utilities its markup uses. Every writer of a Spec page compiles it beside the page:
// a design.css compiled before the Options existed holds none of their classes.

import tailwind from '@tailwindcss/postcss';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const GLOBALS = path.join(ROOT, 'src/app/globals.css');

/** Compiles `<folder>/design.css` from the classes in `folder` and returns its path. */
export async function buildDesignCss(folder: string): Promise<string> {
  const out = path.join(folder, 'design.css');
  const result = await postcss([tailwind({ base: folder })]).process(readFileSync(GLOBALS, 'utf8'), {
    from: GLOBALS,
    to: out,
  });
  writeFileSync(out, result.css);
  return out;
}
