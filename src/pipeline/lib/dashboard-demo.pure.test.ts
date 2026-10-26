import { describe, expect, it } from 'vitest';
import { demoClock, publicDemoEvents, publicDemoPipeline } from './dashboard-demo.pure';

const REPO = '/home/author/content-library';

describe('success cases', () => {
  it('drops transcript paths and prompts, and makes repository paths relative', () => {
    // ARRANGE
    const line = {
      kind: 'end',
      t: '2026-10-19T13:30:00Z',
      seq: 2,
      span_id: 'a',
      transcript_path: '/home/author/.claude/projects/x/agent.jsonl',
      'gen_ai.input.messages': 'Read /home/author/content-library/brief.md',
      summary: `Wrote ${REPO}/.worktrees/episode-x/docs/brief.md and ${REPO}/README.md`,
    };
    const expected = {
      kind: 'end',
      t: '2026-10-19T13:30:00Z',
      seq: 2,
      span_id: 'a',
      summary: 'Wrote docs/brief.md and README.md',
    };
    // ACT
    const text = publicDemoEvents(`${JSON.stringify(line)}\n`, REPO);
    // ASSERT
    expect(JSON.parse(text.trim())).toEqual(expected);
    expect(text.endsWith('\n')).toBe(true);
  });

  it('removes the local server ports from the pipeline', () => {
    // ARRANGE
    const pipeline = [
      'status: approved',
      'dev_port: 4003',
      'spec_port: 4004',
      'jobs:',
      '  - id: build',
      '    port: 4005',
    ];
    const expected = ['status: approved', 'jobs:', '  - id: build'].join('\n');
    // ACT
    const text = publicDemoPipeline(pipeline.join('\n'));
    // ASSERT
    expect(text).toBe(expected);
  });

  it('stops the clock at the latest event', () => {
    // ARRANGE
    const events = ['{"t":"2026-10-19T13:00:00Z"}', '{"t":"2026-10-19T20:57:02Z"}', '{"t":"2026-10-19T14:00:00Z"}'];
    const expected = Date.parse('2026-10-19T20:57:02Z');
    // ACT
    const clock = demoClock(events.join('\n'));
    // ASSERT
    expect(clock()).toBe(expected);
  });
});

describe('failure cases', () => {
  it('rejects an events file with no timestamp to stop the clock at', () => {
    // ARRANGE
    const events = '{"kind":"start"}\n';
    const expected = /no event timestamp/;
    // ACT
    const read = () => demoClock(events);
    // ASSERT
    expect(read).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('keeps blank and unparseable lines out of the public copy', () => {
    // ARRANGE
    const events = '{"kind":"start","seq":1}\n\nnot json\n';
    const expected = '{"kind":"start","seq":1}\n';
    // ACT
    const text = publicDemoEvents(events, REPO);
    // ASSERT
    expect(text).toBe(expected);
  });
});
