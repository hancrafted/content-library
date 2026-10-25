// The hand fixes of a Run (design-ADR 0016, A fix by hand feeds back, rule 19): every `fix(...)` commit that touched
// a content path since the Run's last Gate, with its `Feeds:` value. Content paths are the lines of
// `.husky/feeds-paths`, the file the commit gate reads, so Promotion lists exactly what the gate checked. Reads git;
// `hand-fixes.pure.ts` turns the list into the Harvest report's cards.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { HandFix } from './hand-fixes.pure.ts';

const FIX = /^fix(\([^)]*\))?!?: /;
const EPISODE_FILE = /^src\/components\/episodes\/([^/]+)\//;
const RECORD = '\x1e';
const FIELD = '\x1f';

function git(root: string, args: string[]): string {
  // A git hook exports GIT_DIR and GIT_INDEX_FILE, which would override `cwd`; the tests run inside one.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')));
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024 });
}

/** The newest commit with a `Gate:` trailer whose `Source:` names a file in `staging`. */
function lastGate(root: string, staging: string): string {
  const folder = `${staging.replace(/\/$/, '')}/`;
  const log = git(root, [
    'log',
    `--format=%H${FIELD}%(trailers:key=Gate,valueonly)${FIELD}%(trailers:key=Source,valueonly)${RECORD}`,
  ]);
  const gate = log
    .split(RECORD)
    .map((record) => record.trim().split(FIELD))
    .find(([, gates, sources]) => gates?.trim() && sources?.split('\n').some((line) => line.startsWith(folder)));
  if (!gate) throw new Error(`no Gate commit names ${folder} in its Source line; is that the Run's Staging folder?`);
  return gate[0];
}

/** The commit gate's content paths, as git pathspecs: their wildcards cross `/` like the gate's shell globs do. */
function contentPaths(root: string): string[] {
  const file = path.join(root, '.husky/feeds-paths');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

/** Whether `file` belongs to an Episode other than `episode`; a pool Slide or a wiki file belongs to none. */
function ofAnotherEpisode(file: string, episode: string): boolean {
  const owner = EPISODE_FILE.exec(file)?.[1];
  return owner !== undefined && owner !== episode;
}

/**
 * Every `fix(...)` commit on content paths since the last Gate of the Run `staging` made for `episode`, oldest
 * first. A Promotion branch sees `main`, so a fix that touched only another Episode's folder is that Run's, not this
 * one's. No feeds-paths file, no list.
 */
export function handFixesOfRun(root: string, staging: string, episode: string): HandFix[] {
  const gate = lastGate(root, staging);
  const content = contentPaths(root);
  if (content.length === 0) return [];
  const log = git(root, [
    'log',
    '--ancestry-path',
    '--no-merges',
    '--topo-order',
    '--reverse',
    '--name-only',
    `--format=${RECORD}%H${FIELD}%s${FIELD}%(trailers:key=Feeds,valueonly)${FIELD}`,
    `${gate}..HEAD`,
    '--',
    ...content,
  ]);
  return log
    .split(RECORD)
    .slice(1)
    .map((record) => {
      const [hash, subject, feeds, names] = record.split(FIELD);
      const files = names.split('\n').filter(Boolean);
      return { hash, subject, feeds: feeds.trim().split('\n')[0] || null, files };
    })
    .filter(({ subject, files }) => FIX.test(subject) && files.some((file) => !ofAnotherEpisode(file, episode)));
}
