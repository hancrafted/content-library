// The approve.ts command line: which file to approve and by whom, and the file with that entry appended. The
// gate tiers themselves live in src/lib/staging-file.pure.ts, which imports nothing but `yaml`, so this script
// reaches it with a relative `.ts` import under bare node.

import {
  appendMetaVerified,
  appendVerified,
  HAN_ACTOR,
  isActor,
  type VerifiedEntry,
} from '../../../src/lib/staging-file.pure.ts';

/**
 * The file with an entry by `by` at `at` appended; `by` must be a `human:<id>` or `process:<id>` actor. An HTML
 * Spec (`.html`) takes it in its meta block, any other file in its frontmatter. With `entry.stamp` (`<producer>/<model>`),
 * `generated` is first set to `{ by: stamp, at: entry.at }`, so no agent types a timestamp.
 */
export function approveText(file: string, text: string, entry: VerifiedEntry & { stamp?: string }): string {
  if (!isActor(entry.by)) throw new Error(`\`${entry.by}\` is not an actor (human:<id> or process:<id>)`);
  const { stamp, ...verified } = entry;
  const generated = stamp === undefined ? undefined : { by: stamp, at: entry.at };
  return file.endsWith('.html')
    ? appendMetaVerified(text, verified, generated)
    : appendVerified(text, verified, generated);
}

const PRODUCER = /^[a-z0-9-]+\/[A-Za-z0-9.-]+$/;

const FLAGS: Record<string, { valid: (v: string) => boolean; need: string }> = {
  '--stamp': { valid: (v) => PRODUCER.test(v), need: '✖ --stamp needs <producer>/<model>, e.g. claude-code/opus-5.5' },
  '--by': { valid: isActor, need: '✖ --by needs an actor (human:<id> or process:<id>)' },
};

/** Removes `--flag <value>` from `rest` and returns the value (undefined when absent); a missing or invalid value throws the usage error. */
function takeFlag(rest: string[], flag: string): string | undefined {
  const at = rest.indexOf(flag);
  if (at === -1) return undefined;
  const value = rest[at + 1];
  const { valid, need } = FLAGS[flag] as (typeof FLAGS)[string];
  if (value === undefined || !valid(value)) throw new Error(need);
  rest.splice(at, 2);
  return value;
}

/** The command line of approve.ts: `<file> [--by <actor>] [--stamp <producer/model>]`, `by` defaulting to Han; a string is the usage error. */
export function parseApproveArgs(argv: readonly string[]): { file: string; by: string; stamp?: string } | string {
  const rest = [...argv];
  let by: string;
  let stamp: string | undefined;
  try {
    stamp = takeFlag(rest, '--stamp');
    by = takeFlag(rest, '--by') ?? HAN_ACTOR;
  } catch (error) {
    return (error as Error).message;
  }
  const [file, ...extra] = rest;
  if (file === undefined || extra.length > 0) return '✖ approve.ts takes one <file>';
  return stamp === undefined ? { file, by } : { file, by, stamp };
}
