import { describe, expect, it } from 'vitest';
import {
  chapterBlock,
  deriveChapters,
  formatTimestamp,
  parseChapterLines,
  parseTimestamp,
  type ChapterSource,
} from './chapters.pure.ts';

const SOURCE: ChapterSource = {
  titleSlide: 'hero',
  sections: [['intro', 'detail'], ['middle', 'more'], ['outro']],
  titles: { hero: 'Titel', intro: 'Einstieg', detail: 'Detail', middle: 'Mitte', more: 'Mehr', outro: 'Schluss' },
  starts: { hero: 0, intro: 30, detail: 60, middle: 125.8, more: 200, outro: 3725 },
};

describe('success cases', () => {
  it('derives one chapter per Section at its first Slide start, titled in the recorded locale', () => {
    // ARRANGE
    const expected = [
      { start: 0, title: 'Einstieg' },
      { start: 125, title: 'Mitte' },
      { start: 3725, title: 'Schluss' },
    ];
    // ACT
    const chapters = deriveChapters(SOURCE);
    // ASSERT
    expect(chapters).toEqual(expected);
  });

  it('writes the chapters between the markers, one timestamp and title per line', () => {
    // ARRANGE
    const expected = [
      '<!-- chapters:start -->',
      '',
      '00:00 Einstieg',
      '02:05 Mitte',
      '1:02:05 Schluss',
      '<!-- chapters:end -->',
    ].join('\n');
    // ACT
    const block = chapterBlock(deriveChapters(SOURCE));
    // ASSERT
    expect(block).toBe(expected);
  });

  it('reads a block back into the chapters it was written from', () => {
    // ARRANGE
    const chapters = deriveChapters(SOURCE);
    const lines = chapterBlock(chapters).split('\n').slice(2, -1);
    // ACT
    const parsed = parseChapterLines(lines);
    // ASSERT
    expect(parsed).toEqual({ chapters, bad: [] });
  });
});

describe('failure cases', () => {
  it('reports lines that are no timestamp and title', () => {
    // ARRANGE
    const lines = ['00:00 Einstieg', 'Mitte', '99 Schluss'];
    const expected = ['Mitte', '99 Schluss'];
    // ACT
    const parsed = parseChapterLines(lines);
    // ASSERT
    expect(parsed.bad).toEqual(expected);
  });

  it('reads no seconds from text that is no timestamp', () => {
    // ARRANGE
    const text = 'soon';
    // ACT
    const seconds = parseTimestamp(text);
    // ASSERT
    expect(seconds).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('starts a Section whose first Slide was not found at its first found Slide', () => {
    // ARRANGE
    const source = { ...SOURCE, starts: { hero: 0, detail: 70, middle: 125, outro: 300 } };
    const expected = [0, 125, 300];
    // ACT
    const starts = deriveChapters(source).map((chapter) => chapter.start);
    // ASSERT
    expect(starts).toEqual(expected);
  });

  it('leaves out a Section none of whose Slides was found', () => {
    // ARRANGE
    const source = { ...SOURCE, starts: { hero: 0, intro: 10, outro: 300 } };
    const expected = ['Einstieg', 'Schluss'];
    // ACT
    const titles = deriveChapters(source).map((chapter) => chapter.title);
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('falls back to the Slide slug when a title is missing', () => {
    // ARRANGE
    const source = { ...SOURCE, titles: {} };
    const expected = 'intro';
    // ACT
    const title = deriveChapters(source)[0]?.title;
    // ASSERT
    expect(title).toBe(expected);
  });

  it('round-trips timestamps either side of the hour', () => {
    // ARRANGE
    const seconds = [0, 59, 600, 3599, 3600, 7325];
    // ACT
    const back = seconds.map((value) => parseTimestamp(formatTimestamp(value)));
    // ASSERT
    expect(back).toEqual(seconds);
  });
});
