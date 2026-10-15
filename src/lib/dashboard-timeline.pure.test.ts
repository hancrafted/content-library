import { describe, expect, it } from 'vitest';
import type { RunLogLine } from '../../skills/new-episode/scripts/run-log.schema.pure';
import { createEpisodeReader } from './dashboard-reader.pure';
import { dashboardTimeline, type Cutoff } from './dashboard-timeline.pure';
import { createMemoryFolder } from './episode-folder.pure';

const RUN_START = Date.parse('2026-10-14T10:00:00Z');
const at = (count: number) => RUN_START + count * 60_000;

const agent = {
  type: 'implementor',
  agent: 'general-purpose',
  skills: [],
  references: [],
  model: 'opus',
};
const job = (id: string, stage: string, listed: { needs?: string[]; skills?: string[]; checks?: string[] } = {}) => ({
  id,
  stage,
  needs: listed.needs ?? [],
  wants: [],
  outputs: [],
  checks: listed.checks ?? [],
  retries: 2,
  agents: [{ ...agent, skills: listed.skills ?? [] }],
});
/** Draft, then a fan-out of two parallel research Jobs, then publish. */
const PIPELINE = JSON.stringify({
  status: 'approved',
  stages: ['brief', 'research', 'pr'],
  jobs: [
    job('draft', 'brief', { skills: ['research', 'tdd'], checks: ['mh'] }),
    job('research-a', 'research', { needs: ['draft'] }),
    job('research-b', 'research', { needs: ['draft'] }),
    job('publish', 'pr', { needs: ['research-a', 'research-b'] }),
  ],
});

type Fields = Omit<RunLogLine, 't' | 'seq' | 'trace_id'>;
const TRACE = 'a'.repeat(32);
/** Span ids are 16 hex characters; each name gets the next one, the same name always the same id. */
const ids = new Map<string, string>();
const id = (name: string) => {
  if (!ids.has(name)) ids.set(name, (ids.size + 1).toString(16).padStart(16, '0'));
  return ids.get(name)!;
};
/** A start line; an Attempt `draft#1` is span `draft-1` and a gate `draft#gate` span `draft-gate`. */
const start = (type: string, name: string, extra: { parent?: string; [key: string]: unknown } = {}) => {
  const { parent = 'run', ...rest } = extra;
  return {
    kind: 'start',
    span_id: id(name.replace('#', '-')),
    type,
    name,
    job: name.split('#')[0],
    parent_span_id: id(parent),
    ...rest,
  } as Fields;
};
const end = (span: string, status: string) => ({ kind: 'end', span_id: id(span), status }) as Fields;
const startRun = (span = 'run') =>
  ({
    kind: 'start-run',
    span_id: id(span),
    run_id: span,
    harness: 'claude-code',
    branch: 'episode/example',
    template_sha: 'b'.repeat(40),
    'gen_ai.request.model': 'claude-opus-5-5',
  }) as Fields;
const startAgent = (name: string, parent: string) =>
  ({
    ...start('agent', name, { parent }),
    job: name.split('/')[0],
    role: 'implementor',
    harness: 'claude-code',
    source: 'measured',
    transcript_path: 'transcript.jsonl',
    'gen_ai.operation.name': 'invoke_agent',
    'gen_ai.agent.name': 'general-purpose',
  }) as Fields;
const skill = (span: string, name: string) =>
  ({
    kind: 'event',
    span_id: id(span),
    name: 'skill.invoke',
    source: 'measured',
    attributes: { 'skill.name': name },
  }) as Fields;
const check = (span: string, name: string, value: string) =>
  ({ kind: 'score', span_id: id(span), name: 'check', value, source: `check:${name}` }) as Fields;
const endRun = (span = 'run') => ({ kind: 'end-run', span_id: id(span), status: 'ok' }) as Fields;

/** Draft fails its first Attempt and passes its retry, its agent's skills and check, behind a gate; research fans out; the Run ends at minute 31. */
const RUN: [number, Fields][] = [
  [0, startRun()],
  [1, start('job', 'draft')],
  [1, start('attempt', 'draft#1', { attempt: 1, parent: 'draft' })],
  [5, end('draft-1', 'error')],
  [6, start('attempt', 'draft#2', { attempt: 2, parent: 'draft', retry_of: id('draft-1') })],
  [6, startAgent('draft/implementor', 'draft-2')],
  [6.5, skill('draft/implementor', 'research')],
  [8, start('gate', 'draft#gate', { parent: 'draft' })],
  [9, end('draft-gate', 'ok')],
  [9.5, skill('draft/implementor', 'tdd')],
  [9.5, check('draft-2', 'mh', 'pass')],
  [9.8, end('draft/implementor', 'ok')],
  [10, end('draft-2', 'ok')],
  [10, end('draft', 'ok')],
  [11, start('job', 'research-a')],
  [11, start('job', 'research-b')],
  [15, end('research-a', 'ok')],
  [20, end('research-b', 'ok')],
  [21, start('job', 'publish')],
  [30, end('publish', 'ok')],
  [31, endRun()],
];

const jsonl = (entries: readonly [number, Fields][]) =>
  entries
    .map(([minute, fields], index) =>
      JSON.stringify({ trace_id: TRACE, ...fields, t: new Date(at(minute)).toISOString(), seq: index + 1 }),
    )
    .join('\n') + '\n';

/** One poll of an in-memory Episode folder holding the pipeline and these events, read at `readAt`. */
async function polled(entries: readonly [number, Fields][], readAt: number) {
  const folder = createMemoryFolder('example', { 'pipeline.yml': PIPELINE, 'events.jsonl': jsonl(entries) });
  return createEpisodeReader(folder, () => readAt).poll();
}

const states = (view: { jobs: readonly { id: string; state: string }[] } | undefined) =>
  view?.jobs.map((entry) => `${entry.id}:${entry.state}`);

describe('success cases', () => {
  it('shows the reading as polled while live', async () => {
    // ARRANGE
    const reading = await polled(RUN, at(40));
    const expectedNow = at(40);
    // ACT
    const shown = dashboardTimeline(reading).at('live');
    // ASSERT
    expect(shown.view).toBe(reading.read.view);
    expect(shown.events).toBe(reading.read.events);
    expect(shown.now).toBe(expectedNow);
  });

  it("equals the live view when replayed at the Run's end", async () => {
    // ARRANGE
    const reading = await polled(RUN, at(40));
    const timeline = dashboardTimeline(reading);
    // ACT
    const replayed = timeline.at(at(31));
    // ASSERT
    expect(replayed.view).toEqual(reading.read.view);
    expect(replayed.events).toEqual(reading.read.events);
  });

  it('reads a Job open at the cutoff as running and the Jobs after it as waiting, though the Run ended later', async () => {
    // ARRANGE
    const timeline = dashboardTimeline(await polled(RUN, at(40)));
    const expected = ['draft:ok', 'research-a:running', 'research-b:running', 'publish:waiting'];
    const expectedRun = 'running';
    const cutoff = at(12);
    // ACT
    const { view, now } = timeline.at(cutoff);
    // ASSERT
    expect(states(view)).toEqual(expected);
    expect(view?.runs[0].status).toBe(expectedRun);
    expect(now).toBe(cutoff);
  });

  it('shows a failed Attempt with the Job still running between Attempts, and the retry after', async () => {
    // ARRANGE
    const timeline = dashboardTimeline(await polled(RUN, at(40)));
    const expectedState = 'running';
    const expectedBetween = [{ name: 'draft#1', status: 'error' }];
    const expectedAfter = [
      { name: 'draft#1', status: 'error' },
      { name: 'draft#2', status: 'running', retry_of: id('draft-1') },
    ];
    // ACT
    const between = timeline.at(at(5.5)).view?.jobs[0];
    const after = timeline.at(at(7)).view?.jobs[0];
    // ASSERT
    expect(between?.state).toBe(expectedState);
    expect(between?.attempts).toMatchObject(expectedBetween);
    expect(after?.attempts).toMatchObject(expectedAfter);
  });

  it('shows a Job at its open gate, and past it once the gate closed', async () => {
    // ARRANGE
    const timeline = dashboardTimeline(await polled(RUN, at(40)));
    const expectedOpen = 'gate';
    const expectedClosed = 'running';
    // ACT
    const open = timeline.at(at(8.5)).view;
    const closed = timeline.at(at(9.5)).view;
    // ASSERT
    expect(open?.jobs[0].state).toBe(expectedOpen);
    expect(open?.openGates).toHaveLength(1);
    expect(closed?.jobs[0].state).toBe(expectedClosed);
    expect(closed?.openGates).toEqual([]);
  });

  it('shows fanned-out Jobs ending apart, the Job that needs both still waiting', async () => {
    // ARRANGE
    const timeline = dashboardTimeline(await polled(RUN, at(40)));
    const expected = ['draft:ok', 'research-a:ok', 'research-b:running', 'publish:waiting'];
    // ACT
    const { view } = timeline.at(at(17));
    // ASSERT
    expect(states(view)).toEqual(expected);
  });

  it('gives the event log only the records stamped no later than the cutoff', async () => {
    // ARRANGE
    const timeline = dashboardTimeline(await polled(RUN, at(40)));
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    // ACT
    const { events } = timeline.at(at(10));
    // ASSERT
    expect(events.map((event) => event.number)).toEqual(expected);
  });

  it('shows on the chips only the skills and checks seen by the cutoff', async () => {
    // ARRANGE
    const timeline = dashboardTimeline(await polled(RUN, at(40)));
    const chipsAt = (cutoff: Cutoff) => {
      const chips = timeline.at(cutoff).view!.jobs[0].chips;
      return [...chips.skills, ...chips.checks].map((chip) => `${chip.name}:${chip.state}`);
    };
    const expectedBefore = ['research:run', 'tdd:pending', 'mh:pending'];
    const expectedLive = ['research:run', 'tdd:run', 'mh:pass'];
    // ACT
    const before = chipsAt(at(8));
    const live = chipsAt('live');
    // ASSERT
    expect(before).toEqual(expectedBefore);
    expect(live).toEqual(expectedLive);
  });

  it("spans a finished Run's start to its end, and an open Run's start to the reading", async () => {
    // ARRANGE
    const finished = dashboardTimeline(await polled(RUN, at(40)));
    const open = dashboardTimeline(await polled(RUN.slice(0, 10), at(40)));
    const expectedFinished = { start: at(0), end: at(31) };
    const expectedOpen = { start: at(0), end: at(40) };
    // ACT
    const ranges = [finished.range, open.range];
    // ASSERT
    expect(ranges).toEqual([expectedFinished, expectedOpen]);
  });

  it('maps a cutoff to a slider position and the position back to the cutoff', async () => {
    // ARRANGE
    const timeline = dashboardTimeline(await polled(RUN, at(40)));
    const stops = [
      { at: 0, position: 0 },
      { at: 1 / 3, position: 1 / 3 },
      { at: 2 / 3, position: 2 / 3 },
      { at: 1, position: 1 },
    ];
    // Four of draft's nine minutes into the first of three stages.
    const expectedPosition = 4 / 27;
    const expectedCutoff = at(5);
    const digits = { position: 10, milliseconds: 0 };
    // ACT
    const position = timeline.position(expectedCutoff, stops);
    const cutoff = timeline.seekPosition(position, stops);
    // ASSERT
    expect(position).toBeCloseTo(expectedPosition, digits.position);
    expect(cutoff).toBeCloseTo(expectedCutoff, digits.milliseconds);
  });

  it('turns Live off holding the leading edge, and seeks to it or past it back to Live', async () => {
    // ARRANGE
    const timeline = dashboardTimeline(await polled(RUN, at(40)));
    const expectedLive = 'live';
    const expectedHeld = at(31);
    // ACT
    const held = timeline.toggle(false);
    const resumed = [timeline.toggle(true), timeline.seek(at(31)), timeline.seek(at(50))];
    const end = timeline.seekPosition(1, [
      { at: 0, position: 0 },
      { at: 1, position: 1 },
    ]);
    // ASSERT
    expect(held).toBe(expectedHeld);
    expect(timeline.moment(held)).toBe(expectedHeld);
    expect(resumed).toEqual([expectedLive, expectedLive, expectedLive]);
    expect(end).toBe(expectedLive);
  });
});

describe('failure cases', () => {
  it('skips malformed source lines, which carry no time to replay', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example', {
      'pipeline.yml': PIPELINE,
      'events.jsonl': jsonl(RUN) + '{not json\n',
    });
    const reading = await createEpisodeReader(folder, () => at(40)).poll();
    const expected = ['draft:ok', 'research-a:running', 'research-b:running', 'publish:waiting'];
    // ACT
    const { view, events } = dashboardTimeline(reading).at(at(12));
    // ASSERT
    expect(states(view)).toEqual(expected);
    expect(events.every((event) => event.line !== undefined)).toBe(true);
  });

  it('stays Live without a readable event, there being nothing to replay', async () => {
    // ARRANGE
    const reading = await polled([], at(40));
    const timeline = dashboardTimeline(reading);
    const expectedLive = 'live';
    // ACT
    const cutoffs = [timeline.toggle(false), timeline.seek(at(5)), timeline.seekPosition(0, [])];
    const moment = timeline.moment(at(5));
    const shown = timeline.at(at(5));
    // ASSERT
    expect(timeline.range).toBeNull();
    expect(cutoffs).toEqual([expectedLive, expectedLive, expectedLive]);
    expect(moment).toBeNull();
    expect(shown.view).toBe(reading.read.view);
  });
});

describe('edge cases', () => {
  it('keeps a finished Run finished when replayed at its end, however late the reading', async () => {
    // ARRANGE
    const early = dashboardTimeline(await polled(RUN, at(40)));
    const late = dashboardTimeline(await polled(RUN, at(400)));
    const expectedStatus = 'ok';
    // ACT
    const replayed = late.at(late.toggle(false)).view;
    const expected = early.at(at(31)).view;
    // ASSERT
    expect(late.range).toEqual(early.range);
    expect(replayed?.runs[0].status).toBe(expectedStatus);
    expect(replayed).toEqual(expected);
  });

  it('clamps a cutoff before the Run to its start, every Job still waiting', async () => {
    // ARRANGE
    const timeline = dashboardTimeline(await polled(RUN, at(40)));
    const expected = ['draft:waiting', 'research-a:waiting', 'research-b:waiting', 'publish:waiting'];
    // ACT
    const cutoff = timeline.seek(at(-5));
    const { view } = timeline.at(at(-5));
    // ASSERT
    expect(cutoff).toBe(at(0));
    expect(states(view)).toEqual(expected);
  });

  it('starts at the current Run, the latest started by time, not the last in the log', async () => {
    // ARRANGE
    const earlier: [number, Fields][] = [
      [-100, startRun('old')],
      [-90, endRun('old')],
    ];
    const expected = { start: at(0), end: at(31) };
    // ACT
    const { range } = dashboardTimeline(await polled([...RUN, ...earlier], at(40)));
    // ASSERT
    expect(range).toEqual(expected);
  });

  it('includes every event stamped at the cutoff, the later sequence number deciding the end', async () => {
    // ARRANGE
    const tied: [number, Fields][] = [
      [0, startRun()],
      [1, start('job', 'draft')],
      [4, end('draft', 'error')],
      [4, end('draft', 'ok')],
    ];
    const expected = ['draft:ok', 'research-a:waiting', 'research-b:waiting', 'publish:waiting'];
    // ACT
    const { view } = dashboardTimeline(await polled(tied, at(40))).at(at(4));
    // ASSERT
    expect(states(view)).toEqual(expected);
  });
});
