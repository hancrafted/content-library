// Shared by the post-build checks that read the exported stylesheets.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return name.endsWith('.css') ? [path] : [];
  });
}

/** The text of each `@media print{...}` block, whitespace and quotes stripped. */
export function printBlocks(css: string): string[] {
  const flat = css.replace(/\s+/g, '').replace(/["']/g, '');
  return flat.split('@mediaprint{').slice(1);
}
