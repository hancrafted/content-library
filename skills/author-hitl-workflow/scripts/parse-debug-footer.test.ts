import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const SCRIPT = 'skills/author-hitl-workflow/scripts/parse-debug-footer.ts';
const dir = mkdtempSync(join(tmpdir(), 'parse-debug-footer-'));
/** A file the script reads. */
const saved = (name: string, text: string): string => {
  const path = join(dir, name);
  writeFileSync(path, text);
  return path;
};
/** The script run under plain node, as the skill runs it. */
const parse = (...args: string[]) => spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8' });
/** A reply ending in a footer whose source is `source`. */
const reply = (source: string): string =>
  `Done.\n\n[hitl-debug] workflow=trip "Trip" · stage=brief "Brief" · job=ask "Ask" · prompt=copy · step=do · level=chat · demo=on · locale=en · source=${source}`;
const [english, german] = [saved('trip.en.yml', 'id: trip\n'), saved('trip.de.yml', 'id: trip\n# de\n')];
/** The short hash of the pair above, worked out with `shasum -a 256` over the length-prefixed pair. */
const PAIR_SOURCE = 'b30e20cd';

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('success cases', () => {
  it('prints where the reply came from, and that the pair has not changed since', () => {
    // ARRANGE
    const expected = { job: { id: 'ask', title: 'Ask' }, source: PAIR_SOURCE };
    // ACT
    const run = parse(saved('same.md', reply(PAIR_SOURCE)), english, german);
    const read = JSON.parse(run.stdout) as { scope: object; changed: boolean };
    // ASSERT
    expect(read.scope).toMatchObject(expected);
    expect(read.changed).toBe(false);
  });
});

describe('failure cases', () => {
  it('exits 1 on a reply without a footer', () => {
    // ARRANGE
    const problem = 'The reply has no [hitl-debug] line.';
    // ACT
    const run = parse(saved('none.md', 'Just an answer.'));
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(problem);
  });
});

describe('edge cases', () => {
  it('says the pair changed when its hash is not the footer source', () => {
    // ARRANGE
    const old = '00000000';
    // ACT
    const run = parse(saved('old.md', reply(old)), english, german);
    const read = JSON.parse(run.stdout) as { changed: boolean };
    // ASSERT
    expect(read.changed).toBe(true);
  });
});
