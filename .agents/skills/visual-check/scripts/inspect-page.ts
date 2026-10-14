// Prints DOM numbers as JSON and, with --out, saves screenshots, by driving one
// shared chrome-headless-shell over the DevTools protocol (Node's built-in
// WebSocket, no dependency). The first call starts the browser detached; later
// calls, parallel ones too, connect to it and use their own tab. A watchdog
// process ends it after 10 idle minutes. See ../SKILL.md.
import path from 'node:path';
import { ensureBrowser, stopBrowser, touch, watch } from './browser.ts';
import { connect } from './cdp.ts';
import { expandJobs, parseArgs, type Job } from './inspect-page.pure.ts';
import { inspect } from './page.ts';

/** With several jobs each needs its own file: `shot.png` becomes `shot-<n>-<theme>.png`. */
function outFor(out: string | undefined, job: Job, index: number): string | undefined {
  if (!out) return undefined;
  const { dir, name, ext } = path.parse(out);
  return path.join(dir, `${name}-${index + 1}${job.theme ? `-${job.theme}` : ''}${ext}`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv[0] === '--watch') return watch(Number(argv[1]));
  const args = parseArgs(argv);
  if ('error' in args) throw new Error(args.error);
  if (args.stop) {
    console.log(JSON.stringify({ stopped: stopBrowser() }));
    return;
  }
  const endpoint = await ensureBrowser();
  touch();
  const connection = await connect(endpoint.port);
  try {
    const jobs = expandJobs(args.urls, args.themes);
    const entries = [];
    for (const [index, job] of jobs.entries()) {
      const out = jobs.length === 1 ? args.out : outFor(args.out, job, index);
      entries.push(await inspect(connection, args, { ...job, out }));
    }
    touch();
    console.log(JSON.stringify(entries, null, 2));
  } finally {
    connection.socket.close();
  }
}

main().catch((error: Error) => {
  console.error(`✖ ${error.message}`);
  process.exitCode = 1;
});
