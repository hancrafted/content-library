import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { inlineSpecPage } from '../../../src/pipeline/lib/spec-css.ts';
import { hasDesignLink } from '../../../src/pipeline/lib/spec-inline.pure.ts';

const pages = process.argv.slice(2).map((page) => path.resolve(page));
if (pages.length === 0 || pages.some((page) => !existsSync(page))) {
  console.error('✖ usage: node skills/new-episode/scripts/spec-inline.ts <spec.html …> (each file must exist)');
  process.exit(1);
}
for (const page of pages) {
  const linked = hasDesignLink(readFileSync(page, 'utf8'));
  if (linked) await inlineSpecPage(page);
  console.log(`${linked ? '✔ inlined' : '· already self-contained'} ${path.relative(process.cwd(), page)}`);
}
