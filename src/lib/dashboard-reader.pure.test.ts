import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createEpisodeReader, openEpisode } from './dashboard-reader.pure';
import { createMemoryFolder, type EpisodeFolder } from './episode-folder.pure';

const fixture = (name: string) =>
  readFileSync(new URL(`../../tests/fixtures/pipeline-dashboard/${name}`, import.meta.url), 'utf8');

/** A clock that ticks one second per reading, from a fixed instant. */
function clockFrom(start: number) {
  let now = start - 1000;
  return () => (now += 1000);
}

/** The in-memory folder with one file's reads refused, as a revoked browser permission refuses them. */
function refusing(folder: EpisodeFolder, refused: { path?: string }): EpisodeFolder {
  const guard = (path: string) => {
    if (path === refused.path) throw Object.assign(new Error('Read access denied'), { name: 'NotAllowedError' });
  };
  return {
    name: folder.name,
    stat: async (path) => (guard(path), folder.stat(path)),
    readText: async (path) => (guard(path), folder.readText(path)),
    readBytes: async (path, start) => (guard(path), folder.readBytes(path, start)),
    exists: (path) => folder.exists(path),
  };
}

const START = Date.parse('2026-10-14T16:30:00Z');

describe('success cases', () => {
  it('opens a folder with its first reading, stamped by the clock, and stamps each later poll', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example', {
      'pipeline.yml': fixture('pipeline.yml'),
      'events.jsonl': fixture('events.jsonl'),
    });
    const expectedCondition = 'live';
    const expectedOpenedAt = START;
    const expectedPolledAt = START + 1000;
    // ACT
    const { reader, initial } = await openEpisode(folder, clockFrom(START));
    const next = await reader.poll();
    // ASSERT
    expect(initial.read.condition).toBe(expectedCondition);
    expect(initial.readAt).toBe(expectedOpenedAt);
    expect(next.readAt).toBe(expectedPolledAt);
    expect(next.read.view).toEqual(initial.read.view);
  });

  it('retains original events once across polls and clears the event timeline when truncated', async () => {
    // ARRANGE
    const raw = fixture('events.jsonl').split('\n')[0];
    const folder = createMemoryFolder('example', {
      'pipeline.yml': fixture('pipeline.yml'),
      'events.jsonl': `${raw}\n`,
    });
    const reader = createEpisodeReader(folder, clockFrom(START));
    const expectedError = 'not a JSON object.';
    // ACT
    const first = (await reader.poll()).read;
    folder.write('events.jsonl', `${raw}\n{bad\n`);
    const second = (await reader.poll()).read;
    const unchanged = (await reader.poll()).read;
    folder.write('events.jsonl', '');
    const cleared = (await reader.poll()).read;
    // ASSERT
    expect(first.events.map((entry) => entry.raw)).toEqual([raw]);
    expect(second.events[1].error).toContain(expectedError);
    expect(unchanged.events).toEqual(second.events);
    expect(cleared.events).toEqual([]);
    expect(first.events).toHaveLength(1);
  });

  it('reads only the bytes appended since the last poll, carrying an unfinished line until it ends', async () => {
    // ARRANGE
    const [first, second] = fixture('events.jsonl').split('\n');
    const folder = createMemoryFolder('example', {
      'pipeline.yml': fixture('pipeline.yml'),
      'events.jsonl': `${first}\n${second.slice(0, 10)}`,
    });
    const reader = createEpisodeReader(folder, clockFrom(START));
    const overwritten = `${'x'.repeat(first.length)}\n${second}\n`;
    const expectedOffset = new TextEncoder().encode(overwritten).length;
    // ACT
    const partial = (await reader.poll()).read;
    folder.write('events.jsonl', overwritten);
    const whole = (await reader.poll()).read;
    // ASSERT
    expect(partial.events.map((entry) => entry.raw)).toEqual([first]);
    expect(whole.events.map((entry) => entry.raw)).toEqual([first, second]);
    expect(whole.errors).toEqual([]);
    expect(whole.offset).toBe(expectedOffset);
  });

  it('re-reads pipeline.yml only when its modification time changes', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example', {
      'pipeline.yml': fixture('pipeline.yml'),
      'events.jsonl': fixture('events.jsonl'),
    });
    const reader = createEpisodeReader(folder, clockFrom(START));
    const unchangedTime = 1;
    const expectedFile = 'pipeline.yml';
    // ACT
    const first = (await reader.poll()).read;
    folder.write('pipeline.yml', 'jobs: [', unchangedTime);
    const cached = (await reader.poll()).read;
    folder.write('pipeline.yml', 'jobs: [');
    const reread = (await reader.poll()).read;
    // ASSERT
    expect(cached.errors).toEqual([]);
    expect(cached.view).toEqual(first.view);
    expect(reread.errors.join('\n')).toContain(expectedFile);
  });

  it('reads the Spec port the pipeline names once the folder is selected', async () => {
    // ARRANGE
    const expectedSpecPort = 4003;
    const pipeline = fixture('pipeline.yml').replace(
      /^status: .*$/m,
      (line) => `${line}\ndev_port: 4002\nspec_port: 4003`,
    );
    const folder = createMemoryFolder('example', { 'pipeline.yml': pipeline, 'events.jsonl': fixture('events.jsonl') });
    // ACT
    const { initial } = await openEpisode(folder, clockFrom(START));
    // ASSERT
    expect(initial.read.pipeline?.specPort).toBe(expectedSpecPort);
  });
});

describe('failure cases', () => {
  it('exposes read-access failures, keeps the last view and recovers on a fresh read', async () => {
    // ARRANGE
    const refused: { path?: string } = {};
    const memory = createMemoryFolder('example', {
      'pipeline.yml': fixture('pipeline.yml'),
      'events.jsonl': fixture('events.jsonl'),
    });
    const reader = createEpisodeReader(refusing(memory, refused), clockFrom(START));
    const expectedFile = 'events.jsonl';
    const expectedFailure = 'Read access denied';
    const expectedError = 'error';
    const expectedRecovered = 'live';
    // ACT
    const initial = (await reader.poll()).read;
    refused.path = expectedFile;
    const denied = (await reader.poll()).read;
    refused.path = undefined;
    const recovered = (await reader.poll()).read;
    // ASSERT
    expect(denied.condition).toBe(expectedError);
    expect(denied.errors.join('\n')).toContain(expectedFailure);
    expect(denied.errors.join('\n')).toContain(expectedFile);
    expect(denied.offset).toBe(initial.offset);
    expect(denied.view).toEqual(initial.view);
    expect(recovered.condition).toBe(expectedRecovered);
    expect(recovered.errors).toEqual([]);
    expect(recovered.offset).toBe(initial.offset);
  });

  it('reports malformed JSON objects and preserves subsequent valid records', async () => {
    // ARRANGE
    const runLine = fixture('events.jsonl').split('\n')[0];
    const folder = createMemoryFolder('example', {
      'pipeline.yml': fixture('pipeline.yml'),
      'events.jsonl': `{}\n[]\n${runLine}\n`,
    });
    const expectedCondition = 'error';
    const expectedInvalidKind = 'events.jsonl line 1: kind must be one of';
    const expectedInvalidJson = 'events.jsonl line 2: not a JSON object.';
    const expectedRun = '2026-10-14T16-24-58Z';
    // ACT
    const result = (await createEpisodeReader(folder, clockFrom(START)).poll()).read;
    // ASSERT
    expect(result.condition).toBe(expectedCondition);
    expect(result.errors[0]).toContain(expectedInvalidKind);
    expect(result.errors[1]).toBe(expectedInvalidJson);
    expect(result.view?.runs.map((run) => run.name)).toEqual([expectedRun]);
  });

  it('keeps malformed YAML visible across polls of an unchanged version', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example', { 'pipeline.yml': 'jobs: [' });
    const reader = createEpisodeReader(folder, clockFrom(START));
    const expectedCondition = 'error';
    const expectedFile = 'pipeline.yml';
    // ACT
    const first = (await reader.poll()).read;
    const second = (await reader.poll()).read;
    // ASSERT
    expect(first.condition).toBe(expectedCondition);
    expect(second.condition).toBe(expectedCondition);
    expect(second.errors.join('\n')).toContain(expectedFile);
  });

  it.each([
    { missing: 'pipeline.yml', condition: 'error' },
    { missing: 'events.jsonl', condition: 'waiting' },
  ])('names a missing $missing with condition $condition', async ({ missing, condition }) => {
    // ARRANGE
    const folder = createMemoryFolder('example', { 'pipeline.yml': fixture('pipeline.yml'), 'events.jsonl': '' });
    folder.remove(missing);
    const expectedFile = missing;
    // ACT
    const result = (await createEpisodeReader(folder, clockFrom(START)).poll()).read;
    // ASSERT
    expect(result.condition).toBe(condition);
    expect(result.errors.join('\n')).toContain(expectedFile);
    expect(result.offset).toBe(0);
  });

  it('refuses to open a folder without a readable pipeline.yml, naming the file', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example', { 'events.jsonl': '' });
    const expectedMessage = 'pipeline.yml: Waiting for file. pipeline.yml not found.';
    // ACT
    const error = await openEpisode(folder, clockFrom(START)).catch((cause: Error) => cause);
    // ASSERT
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(expectedMessage);
  });
});

describe('edge cases', () => {
  it('resets folded spans, errors, partial tail and debug offset on truncation to empty', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example', {
      'pipeline.yml': fixture('pipeline.yml'),
      'events.jsonl': fixture('events.jsonl') + 'not-json\n{"tail":',
    });
    const reader = createEpisodeReader(folder, clockFrom(START));
    const expectedError = 'events.jsonl line 211';
    const expectedState = 'waiting';
    const expectedJobCount = 18;
    // ACT
    const malformed = (await reader.poll()).read;
    folder.write('events.jsonl', '');
    const empty = (await reader.poll()).read;
    // ASSERT
    expect(malformed.errors.join('\n')).toContain(expectedError);
    expect(empty.offset).toBe(0);
    expect(empty.lines).toBe(0);
    expect(empty.errors).toEqual([]);
    expect(empty.view?.runs).toEqual([]);
    expect(empty.view?.jobs.map((job) => job.state)).toEqual(Array(expectedJobCount).fill(expectedState));
  });
});
