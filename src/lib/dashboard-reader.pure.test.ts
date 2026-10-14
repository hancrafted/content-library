import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createEpisodeReader, type EpisodeFile, type EpisodeFolder } from './dashboard-reader.pure';

const fixture = (name: string) =>
  readFileSync(new URL(`../../tests/fixtures/pipeline-dashboard/${name}`, import.meta.url), 'utf8');

class LocalFile implements EpisodeFile {
  textReads = 0;
  slices: number[] = [];
  lastModified = 1;
  constructor(public content: string) {}
  get size() {
    return new TextEncoder().encode(this.content).length;
  }
  async text() {
    this.textReads += 1;
    return this.content;
  }
  slice(start: number) {
    this.slices.push(start);
    return { arrayBuffer: async () => new TextEncoder().encode(this.content).slice(start).buffer };
  }
}

class LocalFolder implements EpisodeFolder {
  name = 'example';
  files = new Map<string, LocalFile>();
  reads: string[] = [];
  unreadable?: string;
  async getFileHandle(name: string) {
    return {
      getFile: async () => {
        this.reads.push(name);
        if (name === this.unreadable) throw Object.assign(new Error('Read access denied'), { name: 'NotAllowedError' });
        const file = this.files.get(name);
        if (!file) throw Object.assign(new Error(`${name} not found`), { name: 'NotFoundError' });
        return file;
      },
    };
  }
}

describe('success cases', () => {
  it('retains original events once across polls and clears the event timeline when truncated', async () => {
    // ARRANGE
    const folder = new LocalFolder();
    const raw = fixture('events.jsonl').split('\n')[0];
    const events = new LocalFile(`${raw}\n`);
    folder.files.set('pipeline.yml', new LocalFile(fixture('pipeline.yml')));
    folder.files.set('events.jsonl', events);
    const reader = createEpisodeReader(folder);
    const expectedError = 'not a JSON object.';
    // ACT
    const first = await reader.poll();
    events.content += '{bad\n';
    const second = await reader.poll();
    const unchanged = await reader.poll();
    events.content = '';
    const cleared = await reader.poll();
    // ASSERT
    expect(first.events.map((entry) => entry.raw)).toEqual([raw]);
    expect(second.events[1].error).toContain(expectedError);
    expect(unchanged.events).toEqual(second.events);
    expect(cleared.events).toEqual([]);
    expect(first.events).toHaveLength(1);
  });

  it('gets fresh files, reads only appended bytes and reparses pipeline only when modified', async () => {
    // ARRANGE
    const folder = new LocalFolder();
    const pipeline = new LocalFile(fixture('pipeline.yml'));
    const events = new LocalFile(fixture('events.jsonl'));
    folder.files.set('pipeline.yml', pipeline);
    folder.files.set('events.jsonl', events);
    const reader = createEpisodeReader(folder);
    const expectedReads = [
      'pipeline.yml',
      'events.jsonl',
      'pipeline.yml',
      'events.jsonl',
      'pipeline.yml',
      'events.jsonl',
    ];
    const expectedCondition = 'live';
    const expectedParses = 2;
    const expectedTail = '\n';
    const initialSize = events.size;
    // ACT
    const first = await reader.poll();
    events.content += expectedTail;
    const second = await reader.poll();
    pipeline.lastModified = 2;
    const third = await reader.poll();
    // ASSERT
    expect(first.condition).toBe(expectedCondition);
    expect(second.offset).toBe(initialSize + 1);
    expect(third.errors).toEqual([]);
    expect(third.view).toEqual(first.view);
    expect(events.slices).toEqual([0, initialSize]);
    expect(pipeline.textReads).toBe(expectedParses);
    expect(folder.reads).toEqual(expectedReads);
  });
});

describe('failure cases', () => {
  it('exposes read-access failures, keeps the last view and recovers on a fresh read', async () => {
    // ARRANGE
    const folder = new LocalFolder();
    const events = new LocalFile(fixture('events.jsonl'));
    folder.files.set('pipeline.yml', new LocalFile(fixture('pipeline.yml')));
    folder.files.set('events.jsonl', events);
    const reader = createEpisodeReader(folder);
    const expectedFile = 'events.jsonl';
    const expectedFailure = 'Read access denied';
    const expectedError = 'error';
    const expectedRecovered = 'live';
    // ACT
    const initial = await reader.poll();
    folder.unreadable = expectedFile;
    const denied = await reader.poll();
    folder.unreadable = undefined;
    const recovered = await reader.poll();
    // ASSERT
    expect(denied.condition).toBe(expectedError);
    expect(denied.errors.join('\n')).toContain(expectedFailure);
    expect(denied.errors.join('\n')).toContain(expectedFile);
    expect(denied.offset).toBe(initial.offset);
    expect(denied.view).toEqual(initial.view);
    expect(recovered.condition).toBe(expectedRecovered);
    expect(recovered.errors).toEqual([]);
    expect(events.slices).toEqual([0]);
  });

  it('reports malformed JSON objects and preserves subsequent valid records', async () => {
    // ARRANGE
    const folder = new LocalFolder();
    const runLine = fixture('events.jsonl').split('\n')[0];
    folder.files.set('pipeline.yml', new LocalFile(fixture('pipeline.yml')));
    folder.files.set('events.jsonl', new LocalFile(`{}\n[]\n${runLine}\n`));
    const expectedCondition = 'error';
    const expectedInvalidKind = 'events.jsonl line 1: kind must be one of';
    const expectedInvalidJson = 'events.jsonl line 2: not a JSON object.';
    const expectedRun = '2026-10-14T16-24-58Z';
    // ACT
    const result = await createEpisodeReader(folder).poll();
    // ASSERT
    expect(result.condition).toBe(expectedCondition);
    expect(result.errors[0]).toContain(expectedInvalidKind);
    expect(result.errors[1]).toBe(expectedInvalidJson);
    expect(result.view?.runs.map((run) => run.name)).toEqual([expectedRun]);
  });

  it('keeps malformed YAML visible without reparsing an unchanged version', async () => {
    // ARRANGE
    const folder = new LocalFolder();
    const pipeline = new LocalFile('jobs: [');
    folder.files.set('pipeline.yml', pipeline);
    const reader = createEpisodeReader(folder);
    const expectedCondition = 'error';
    const expectedFile = 'pipeline.yml';
    // ACT
    const first = await reader.poll();
    const second = await reader.poll();
    // ASSERT
    expect(first.condition).toBe(expectedCondition);
    expect(second.condition).toBe(expectedCondition);
    expect(second.errors.join('\n')).toContain(expectedFile);
    expect(pipeline.textReads).toBe(1);
  });

  it.each([
    { missing: 'pipeline.yml', condition: 'error' },
    { missing: 'events.jsonl', condition: 'waiting' },
  ])('names a missing $missing with condition $condition', async ({ missing, condition }) => {
    // ARRANGE
    const folder = new LocalFolder();
    folder.files.set('pipeline.yml', new LocalFile(fixture('pipeline.yml')));
    folder.files.set('events.jsonl', new LocalFile(''));
    folder.files.delete(missing);
    const expectedFile = missing;
    // ACT
    const result = await createEpisodeReader(folder).poll();
    // ASSERT
    expect(result.condition).toBe(condition);
    expect(result.errors.join('\n')).toContain(expectedFile);
    expect(result.offset).toBe(0);
  });
});

describe('edge cases', () => {
  it('resets folded spans, errors, partial tail and debug offset on truncation to empty', async () => {
    // ARRANGE
    const folder = new LocalFolder();
    const events = new LocalFile(fixture('events.jsonl') + 'not-json\n{"tail":');
    folder.files.set('pipeline.yml', new LocalFile(fixture('pipeline.yml')));
    folder.files.set('events.jsonl', events);
    const reader = createEpisodeReader(folder);
    const expectedError = 'events.jsonl line 211';
    const expectedState = 'waiting';
    const expectedJobCount = 18;
    // ACT
    const malformed = await reader.poll();
    events.content = '';
    const empty = await reader.poll();
    // ASSERT
    expect(malformed.errors.join('\n')).toContain(expectedError);
    expect(empty.offset).toBe(0);
    expect(empty.lines).toBe(0);
    expect(empty.errors).toEqual([]);
    expect(empty.view?.runs).toEqual([]);
    expect(empty.view?.jobs.map((job) => job.state)).toEqual(Array(expectedJobCount).fill(expectedState));
  });
});
