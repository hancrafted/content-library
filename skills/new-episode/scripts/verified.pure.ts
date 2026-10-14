// The approve.ts command line: which file to approve and by whom, and the file with that entry appended. The
// gate tiers themselves live in src/lib/staging-file.pure.ts, which imports nothing but `yaml`, so this script
// reaches it with a relative `.ts` import under bare node.

import { appendVerified, HAN_ACTOR, isActor } from '../../../src/lib/staging-file.pure.ts';

/** The file with an entry by `by` at `at` appended; `by` must be a `human:<id>` or `process:<id>` actor. */
export function approveText(text: string, by: string, at: string): string {
  if (!isActor(by)) throw new Error(`\`${by}\` is not an actor (human:<id> or process:<id>)`);
  return appendVerified(text, { by, at });
}

/** The command line of approve.ts: `<file> [--by <actor>]`, `by` defaulting to Han; a string is the usage error. */
export function parseApproveArgs(argv: readonly string[]): { file: string; by: string } | string {
  const rest = [...argv];
  let by = HAN_ACTOR;
  const flag = rest.indexOf('--by');
  if (flag !== -1) {
    const value = rest[flag + 1];
    if (value === undefined) return '✖ --by needs an actor';
    if (!isActor(value)) return `✖ --by \`${value}\` is not an actor (human:<id> or process:<id>)`;
    by = value;
    rest.splice(flag, 2);
  }
  const [file, ...extra] = rest;
  return file === undefined || extra.length > 0 ? '✖ approve.ts takes one <file>' : { file, by };
}
