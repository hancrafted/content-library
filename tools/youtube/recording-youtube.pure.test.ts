import { describe, expect, it } from 'vitest';
import { chapterBlock, deriveChapters } from './chapters.pure.ts';
import { validateRecording, type Composition } from './recording.pure.ts';
import { serializeYoutubeFile } from './youtube-file.pure.ts';

const COMPOSITION: Composition = {
  slides: ['hero', 'a', 'b', 'c', 'd'],
  titleSlide: 'hero',
  sections: [['a'], ['b'], ['c'], ['d']],
  titles: { de: { a: 'Eins', b: 'Zwei', c: 'Drei', d: 'Vier' } },
};
const STARTS = { hero: 0, a: 5, b: 100, c: 200, d: 300 };
const YOUTUBE = 'youtube.de.md';

function startsFile(starts: Record<string, number>): string {
  return JSON.stringify({ videoId: 'atPa8aTd-PQ', starts, unmatched: [] });
}

function youtube(block: string, extra = ''): string {
  return serializeYoutubeFile({ description: `Text\n\n${block}${extra}`, pinnedComment: 'Frage?', commentId: '' });
}

function foundMessages(text: string, starts = STARTS): string[] {
  const recording = { 'slide-starts.de.json': startsFile(starts), [YOUTUBE]: text };
  return validateRecording(COMPOSITION, recording).map((violation) => violation.message);
}

function blockOf(starts: Record<string, number>): string {
  return chapterBlock(deriveChapters({ ...COMPOSITION, titles: COMPOSITION.titles.de ?? {}, starts }));
}

describe('success cases', () => {
  it('accepts a block in step with the Slide starts', () => {
    // ARRANGE
    const text = youtube(blockOf(STARTS));
    // ACT
    const found = foundMessages(text);
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it('flags a first chapter that is not at 00:00', () => {
    // ARRANGE
    const starts = { hero: 5, a: 5, b: 100, c: 200, d: 300 };
    const pattern = /first YouTube chapter must be at 00:00/;
    // ACT
    const found = foundMessages(youtube(blockOf(starts)), starts);
    // ASSERT
    expect(found.some((message) => pattern.test(message))).toBe(true);
  });

  it('flags fewer than 3 chapters', () => {
    // ARRANGE
    const starts = { hero: 0, a: 5, b: 100 };
    const composition = { ...COMPOSITION, sections: [['a'], ['b']] };
    const recording = { 'slide-starts.de.json': startsFile(starts), [YOUTUBE]: youtube(blockOf(starts)) };
    const pattern = /at least 3 YouTube chapters/;
    // ACT
    const found = validateRecording(composition, recording).map((violation) => violation.message);
    // ASSERT
    expect(found.some((message) => pattern.test(message))).toBe(true);
  });

  it('flags chapters that do not ascend', () => {
    // ARRANGE
    const block = '<!-- chapters:start -->\n00:00 Eins\n02:00 Zwei\n01:00 Drei\n<!-- chapters:end -->';
    const pattern = /"Drei" must ascend past "Zwei"/;
    // ACT
    const found = foundMessages(youtube(block));
    // ASSERT
    expect(found.some((message) => pattern.test(message))).toBe(true);
  });

  it('flags a chapter shorter than 10 s', () => {
    // ARRANGE
    const starts = { hero: 0, a: 5, b: 100, c: 105, d: 300 };
    const pattern = /"Zwei" must be at least 10s long/;
    // ACT
    const found = foundMessages(youtube(blockOf(starts)), starts);
    // ASSERT
    expect(found.some((message) => pattern.test(message))).toBe(true);
  });

  it('flags a description over 5,000 characters', () => {
    // ARRANGE
    const text = youtube(blockOf(STARTS), `\n\n${'x'.repeat(5000)}`);
    const pattern = /allows 5000/;
    // ACT
    const found = foundMessages(text);
    // ASSERT
    expect(found.some((message) => pattern.test(message))).toBe(true);
  });

  it('flags a block out of step with the Slide starts', () => {
    // ARRANGE
    const stale = blockOf({ hero: 0, a: 5, b: 90, c: 200, d: 300 });
    const pattern = /out of step with the Slide starts/;
    // ACT
    const found = foundMessages(youtube(stale));
    // ASSERT
    expect(found.some((message) => pattern.test(message))).toBe(true);
  });

  it('flags a description with no block', () => {
    // ARRANGE
    const text = serializeYoutubeFile({ description: 'Text', pinnedComment: '', commentId: '' });
    const pattern = /no chapters:start/;
    // ACT
    const found = foundMessages(text);
    // ASSERT
    expect(found.some((message) => pattern.test(message))).toBe(true);
  });
});

describe('edge cases', () => {
  it('asks for Slide starts when the language has none', () => {
    // ARRANGE
    const recording = { [YOUTUBE]: youtube(blockOf(STARTS)) };
    const pattern = /needs a valid slide-starts\.de\.json/;
    // ACT
    const found = validateRecording(COMPOSITION, recording).map((violation) => violation.message);
    // ASSERT
    expect(found.some((message) => pattern.test(message))).toBe(true);
  });

  it('does not count the marker lines against the 5,000 characters', () => {
    // ARRANGE
    const base = `Text\n\n${blockOf(STARTS)}`.replace(/<!-- chapters:(start|end) -->\n?/g, '');
    const filler = 'x'.repeat(5000 - base.length - 1);
    const text = youtube(blockOf(STARTS), `\n${filler}`);
    // ACT
    const found = foundMessages(text);
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('video length and Sections without a start', () => {
  const VIDEO_FILE = 'video.de.json';

  function withVideo(durationSeconds: number): string[] {
    const recording = {
      'slide-starts.de.json': startsFile(STARTS),
      [VIDEO_FILE]: JSON.stringify({ videoId: 'atPa8aTd-PQ', durationSeconds }),
      [YOUTUBE]: youtube(blockOf(STARTS)),
    };
    return validateRecording(COMPOSITION, recording).map((violation) => violation.message);
  }

  it('accepts a last chapter of at least 10 seconds', () => {
    // ARRANGE
    // ACT
    const found = withVideo(310);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('flags a last chapter shorter than 10 seconds against the video length', () => {
    // ARRANGE
    // ACT
    const found = withVideo(305);
    // ASSERT
    expect(found).toEqual(['the last chapter "Vier" must be at least 10s long: the video is 305s']);
  });

  it('flags a Section none of whose Slides has a start, instead of dropping it silently', () => {
    // ARRANGE
    const starts = { hero: 0, a: 5, b: 100, d: 300 };
    const recording = {
      'slide-starts.de.json': JSON.stringify({ videoId: 'atPa8aTd-PQ', starts, unmatched: ['c'] }),
      [YOUTUBE]: youtube(blockOf(starts)),
    };
    // ACT
    const found = validateRecording(COMPOSITION, recording).map((violation) => violation.message);
    // ASSERT
    expect(found).toContain(
      'Section 3 ("c") has no Slide start, so it would get no YouTube chapter; fix its Slide starts first',
    );
  });
});

describe('extra YouTube chapters', () => {
  const TWO_SECTIONS: Composition = {
    slides: ['hero', 'a', 'b', 'c'],
    titleSlide: 'hero',
    sections: [['a', 'b'], ['c']],
    titles: { de: { a: 'Eins', b: 'Zwei', c: 'Drei' } },
  };
  const starts = { hero: 0, a: 5, b: 100, c: 300 };
  const extraChapters = [{ start: 146, title: '5 Eigenschaften der KI' }];

  function found(slideStarts: Record<string, unknown>, block: string): string[] {
    const recording = {
      'slide-starts.de.json': JSON.stringify({ videoId: 'atPa8aTd-PQ', starts, unmatched: [], ...slideStarts }),
      [YOUTUBE]: youtube(block),
    };
    return validateRecording(TWO_SECTIONS, recording).map((violation) => violation.message);
  }

  it('accepts a block that carries the extra chapters of the Slide starts', () => {
    // ARRANGE
    const block = chapterBlock(
      deriveChapters({ ...TWO_SECTIONS, titles: TWO_SECTIONS.titles.de ?? {}, starts, extraChapters }),
    );
    // ACT
    const messages = found({ extraChapters }, block);
    // ASSERT
    expect(messages).toEqual([]);
  });

  it('flags an extra chapter without a start or a title', () => {
    // ARRANGE
    const block = chapterBlock(deriveChapters({ ...TWO_SECTIONS, titles: TWO_SECTIONS.titles.de ?? {}, starts }));
    const bad = [
      { start: -1, title: 'X' },
      { start: 10, title: '' },
    ];
    // ACT
    const messages = found({ extraChapters: bad }, block);
    // ASSERT
    expect(messages).toEqual(
      expect.arrayContaining([expect.stringMatching(/extraChapters must be a list of \{start, title\}/)]),
    );
  });
});
