import { appendMetaVerified, appendVerified, HAN_ACTOR, isActor, type VerifiedEntry } from './staging-file.pure.ts';

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

function takeFlag(rest: string[], flag: string): string | undefined {
  const at = rest.indexOf(flag);
  if (at === -1) return undefined;
  const value = rest[at + 1];
  const { valid, need } = FLAGS[flag] as (typeof FLAGS)[string];
  if (value === undefined || !valid(value)) throw new Error(need);
  rest.splice(at, 2);
  return value;
}

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
