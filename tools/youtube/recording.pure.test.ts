import { describe, expect, it } from 'vitest';
import { validateRecording, type Composition } from './recording.pure.ts';

const COMPOSITION: Composition = { slides: ['hero', 'intro', 'middle', 'outro'] };
const FILE = 'slide-starts.de.json';
const VIDEO = 'atPa8aTd-PQ';

function startsFile(starts: Record<string, number>, unmatched: string[] = []): Record<string, string> {
  return { [FILE]: JSON.stringify({ videoId: VIDEO, starts, unmatched }) };
}

function messages(recording: Record<string, string>): string[] {
  return validateRecording(COMPOSITION, recording).map((violation) => violation.message);
}

describe('success cases', () => {
  it('accepts Slide starts in composition order with the skipped Slide listed as unmatched', () => {
    // ARRANGE
    const recording = startsFile({ hero: 0, intro: 12.5, outro: 300 }, ['middle']);
    const expected: string[] = [];
    // ACT
    const found = messages(recording);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('ignores the other files of the Recording folder', () => {
    // ARRANGE
    const recording = { 'transcript.de.vtt': 'WEBVTT', ...startsFile({ hero: 0, intro: 1, middle: 2, outro: 3 }) };
    const expected: string[] = [];
    // ACT
    const found = messages(recording);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('accepts a Recording folder with no Slide starts yet', () => {
    // ARRANGE
    const recording = { 'transcript.de.vtt': 'WEBVTT' };
    const expected: string[] = [];
    // ACT
    const found = messages(recording);
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('flags a slug the Episode does not have, in starts and in unmatched', () => {
    // ARRANGE
    const recording = startsFile({ hero: 0, ghost: 5, intro: 9, middle: 20, outro: 30 }, ['phantom']);
    const expected = [/"ghost".*not a Slide/, /"phantom".*not a Slide/];
    // ACT
    const found = messages(recording);
    // ASSERT
    expect(found).toHaveLength(expected.length);
    expected.forEach((pattern, index) => expect(found[index]).toMatch(pattern));
  });

  it('flags starts that do not ascend in composition order', () => {
    // ARRANGE
    const recording = startsFile({ hero: 0, intro: 50, middle: 40, outro: 60 });
    const pattern = /"middle".*ascend/;
    // ACT
    const found = messages(recording);
    // ASSERT
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(pattern);
  });

  it('flags equal starts as not ascending', () => {
    // ARRANGE
    const recording = startsFile({ hero: 0, intro: 10, middle: 10, outro: 60 });
    const pattern = /"middle".*ascend/;
    // ACT
    const found = messages(recording);
    // ASSERT
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(pattern);
  });

  it('flags a slug both started and unmatched', () => {
    // ARRANGE
    const recording = startsFile({ hero: 0, intro: 10, middle: 20, outro: 30 }, ['middle']);
    const pattern = /"middle".*both started and unmatched/;
    // ACT
    const found = messages(recording);
    // ASSERT
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(pattern);
  });

  it('flags a Slide that is neither started nor unmatched', () => {
    // ARRANGE
    const recording = startsFile({ hero: 0, intro: 10, outro: 30 });
    const pattern = /"middle".*neither started nor unmatched/;
    // ACT
    const found = messages(recording);
    // ASSERT
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(pattern);
  });

  it.each([
    ['text that is not JSON', 'not json'],
    ['a missing video ID', JSON.stringify({ starts: {}, unmatched: [] })],
    ['a malformed video ID', JSON.stringify({ videoId: 'short', starts: {}, unmatched: [] })],
    ['a negative start', JSON.stringify({ videoId: VIDEO, starts: { hero: -1 }, unmatched: [] })],
    ['a start that is no number', JSON.stringify({ videoId: VIDEO, starts: { hero: 'x' }, unmatched: [] })],
    ['an unmatched list that is no list', JSON.stringify({ videoId: VIDEO, starts: {}, unmatched: 'hero' })],
  ])('flags %s', (_name, text) => {
    // ARRANGE
    const recording = { [FILE]: text };
    const expected = 1;
    // ACT
    const found = validateRecording(COMPOSITION, recording);
    // ASSERT
    expect(found).toHaveLength(expected);
    expect(found[0]?.file).toBe(FILE);
  });
});

describe('edge cases', () => {
  it('names the file each violation sits in', () => {
    // ARRANGE
    const recording = { 'slide-starts.en.json': startsFile({ ghost: 0 })[FILE] ?? '' };
    const expected = 'slide-starts.en.json';
    // ACT
    const files = validateRecording(COMPOSITION, recording).map((violation) => violation.file);
    // ASSERT
    expect(new Set(files)).toEqual(new Set([expected]));
  });

  it('checks the Slide starts of every language', () => {
    // ARRANGE
    const recording = {
      'slide-starts.de.json': startsFile({ hero: 0, intro: 1, middle: 2, outro: 3 })[FILE] ?? '',
      'slide-starts.en.json': startsFile({ hero: 0, intro: 1, middle: 2, ghost: 3 })[FILE] ?? '',
    };
    const expected = 2;
    // ACT
    const found = validateRecording(COMPOSITION, recording);
    // ASSERT
    expect(found).toHaveLength(expected);
  });
});
