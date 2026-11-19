import { describe, expect, it } from 'vitest';
import { isHookMode, subagentEntry } from './claude-adapter.pure.ts';

describe('subagentEntry', () => {
  it('links the session, its transcript and the branch to the topic log', () => {
    // ARRANGE
    const payload = { session_id: 's1', transcript_path: '/t/s1.jsonl', agent_id: 'a1' };
    // ACT
    const entry = subagentEntry('stop', payload, { branch: 'chore/x--1-y', now: new Date('2026-11-19T10:00:00Z') });
    // ASSERT
    expect(entry).toEqual({
      t: '2026-11-19T10:00:00.000Z',
      event: 'subagent-stop',
      session: 's1',
      transcript: '/t/s1.jsonl',
      agent: 'a1',
      branch: 'chore/x--1-y',
    });
  });

  it('knows its two modes', () => {
    expect([isHookMode('start'), isHookMode('stop'), isHookMode('read')]).toEqual([true, true, false]);
  });
});
