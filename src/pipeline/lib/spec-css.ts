import tailwind from '@tailwindcss/postcss';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { inlineDesignCss } from './spec-inline.pure.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const GLOBALS = path.join(ROOT, 'src/app/globals.css');

export async function buildDesignCss(folder: string): Promise<string> {
  const out = path.join(folder, 'design.css');
  const result = await postcss([tailwind({ base: folder })]).process(readFileSync(GLOBALS, 'utf8'), {
    from: GLOBALS,
    to: out,
  });
  writeFileSync(out, result.css);
  return out;
}

export async function inlineSpecPage(page: string): Promise<void> {
  const css = readFileSync(await buildDesignCss(path.dirname(page)), 'utf8');
  writeFileSync(page, inlineDesignCss(readFileSync(page, 'utf8'), css));
}
