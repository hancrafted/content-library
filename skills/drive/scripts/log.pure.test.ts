import { describe, expect, it } from 'vitest';
import { commandEntry, isSubagentEntry, logPath, parseLog, serializeEntry, topicOfBranch } from './log.pure.ts';

describe('topicOfBranch', () => {
  it.each([
    ['chore/drive-fortify-sweep', 'drive-fortify-sweep'],
    ['chore/drive-fortify-sweep--795-log-transcript', 'drive-fortify-sweep'],
    ['main', null],
    [null, null],
    ['feat/', null],
  ])('reads %s as %s', (branch, topic) => {
    expect(topicOfBranch(branch)).toBe(topic);
  });

  it('puts the log under the topic', () => {
    expect(logPath('t')).toBe('.scratch/t/drive.log.jsonl');
  });
});

describe('commandEntry', () => {
  const now = new Date('2026-11-19T10:00:00Z');

  it('records ok on exit 0 and the last error otherwise, preferring the --base flag', () => {
    // ARRANGE
    const facts = { argv: ['worktree', 'done', '--base', 'x'], branch: 'a/b', base: 'main', lastError: 'boom' };
    // ACT
    const ok = commandEntry({ ...facts, exit: 0 }, now);
    const bad = commandEntry({ ...facts, exit: 1 }, now);
    // ASSERT
    expect(ok).toEqual({
      t: '2026-11-19T10:00:00.000Z',
      cmd: 'worktree done --base x',
      branch: 'a/b',
      base: 'x',
      exit: 0,
      result: 'ok',
    });
    expect(bad.result).toBe('boom');
  });
});

describe('parseLog', () => {
  it('round-trips entries and skips damaged lines', () => {
    // ARRANGE
    const entry = {
      t: 't',
      event: 'subagent-start' as const,
      session: 's',
      transcript: '/p.jsonl',
      agent: 'a',
      branch: 'x/y',
    };
    // ACT
    const parsed = parseLog(`${serializeEntry(entry)}not json\n\n`);
    // ASSERT
    expect(parsed).toEqual([entry]);
    expect(isSubagentEntry(parsed[0]!)).toBe(true);
  });
});
