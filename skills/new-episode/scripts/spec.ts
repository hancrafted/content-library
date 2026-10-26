// `npm run episode:spec -- <slug | Episode folder>`: compiles the site's globals.css into the Spec's design.css,
// scanning only the Spec for classes, then serves the Spec for review on `--port`, else the first free port from 4000, never 4382
// (the dashboard's). Saving the review writes the next feedback round (spec-server.ts).

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { SPEC_FILE } from '../../../src/pipeline/lib/episode-spec-page.pure.ts';
import { buildDesignCss } from './spec-css.ts';
import { startSpecServer, type SpecServer } from './spec-server.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const FIRST_PORT = 4000;
const LAST_PORT = 4100;
const DASHBOARD_PORT = 4382;

/** A bare slug names `docs/episodes/<slug>`; anything with a slash is an Episode folder path. */
function episodeFolder(arg: string): string {
  return arg.includes('/') ? path.resolve(arg) : path.join(ROOT, 'docs/episodes', arg);
}

async function listen(folder: string, fixed: number | undefined): Promise<SpecServer> {
  if (fixed !== undefined) return startSpecServer({ folder, port: fixed, now: () => new Date() });
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

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: { port: { type: 'string' }, watch: { type: 'boolean' } },
});
const [arg, ...extra] = positionals;
const port = values.port === undefined ? undefined : Number(values.port);
if (arg === undefined || extra.length > 0 || (port !== undefined && !Number.isInteger(port))) {
  console.error('✖ usage: npm run episode:spec -- <slug | Episode folder> [--port <n>] [--watch]');
  process.exit(1);
}
const folder = episodeFolder(arg);
const spec = path.join(folder, SPEC_FILE);
// --watch: begin-run starts this server before the Spec exists, so wait for spec.html instead of refusing.
while (values.watch && !existsSync(spec)) await new Promise((resolve) => setTimeout(resolve, 1000));
if (!existsSync(spec)) {
  console.error(`✖ ${path.relative(ROOT, spec)} does not exist`);
  process.exit(1);
}
const css = await buildDesignCss(path.dirname(spec));
const server = await listen(folder, port);
console.log(`✔ ${path.relative(ROOT, css)} compiled from src/app/globals.css`);
console.log(
  `✔ Spec review on http://127.0.0.1:${server.port}/ — Save writes ${path.relative(ROOT, folder)}/feedback/<NN>/feedback.md; Ctrl-C stops`,
);
process.on('SIGINT', () => void server.close().then(() => process.exit(0)));
