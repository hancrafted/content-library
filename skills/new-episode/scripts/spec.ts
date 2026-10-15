// `npm run episode:spec -- <slug | Episode folder>`: compiles the site's globals.css into the Spec's design.css,
// scanning only the Spec for classes, then serves the Spec for review on the first free port from 4000, never 4382
// (the dashboard's). Saving the review writes the next feedback round (spec-server.ts).

import tailwind from '@tailwindcss/postcss';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { startSpecServer, type SpecServer } from './spec-server.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const GLOBALS = path.join(ROOT, 'src/app/globals.css');
const FIRST_PORT = 4000;
const LAST_PORT = 4100;
const DASHBOARD_PORT = 4382;

/** A bare slug names `docs/episodes/<slug>`; anything with a slash is an Episode folder path. */
function episodeFolder(arg: string): string {
  return arg.includes('/') ? path.resolve(arg) : path.join(ROOT, 'docs/episodes', arg);
}

/** globals.css through Tailwind with the Spec's folder as the only source, so design.css holds the real tokens. */
async function buildDesignCss(specDir: string): Promise<string> {
  const out = path.join(specDir, 'design.css');
  const result = await postcss([tailwind({ base: specDir })]).process(readFileSync(GLOBALS, 'utf8'), {
    from: GLOBALS,
    to: out,
  });
  writeFileSync(out, result.css);
  return out;
}

async function listen(folder: string): Promise<SpecServer> {
  for (let port = FIRST_PORT; port <= LAST_PORT; port++) {
    if (port === DASHBOARD_PORT) continue;
    try {
      return await startSpecServer({ folder, port, now: () => new Date() });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EADDRINUSE') throw error;
    }
  }
  throw new Error(`no free port from ${FIRST_PORT} to ${LAST_PORT}`);
}

const [arg, ...extra] = process.argv.slice(2);
if (arg === undefined || extra.length > 0) {
  console.error('✖ usage: npm run episode:spec -- <slug | Episode folder>');
  process.exit(1);
}
const folder = episodeFolder(arg);
const spec = path.join(folder, 'spec/spec.html');
if (!existsSync(spec)) {
  console.error(`✖ ${path.relative(ROOT, spec)} does not exist`);
  process.exit(1);
}
const css = await buildDesignCss(path.dirname(spec));
const server = await listen(folder);
console.log(`✔ ${path.relative(ROOT, css)} compiled from src/app/globals.css`);
console.log(
  `✔ Spec review on http://127.0.0.1:${server.port}/ — Save writes ${path.relative(ROOT, folder)}/feedback/<NN>/feedback.md; Ctrl-C stops`,
);
process.on('SIGINT', () => void server.close().then(() => process.exit(0)));
