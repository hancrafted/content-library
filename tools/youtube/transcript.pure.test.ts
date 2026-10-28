import { describe, expect, it } from 'vitest';
import { captionFile, parseSpokenLanguage, transcriptFile, ytDlpArgs } from './transcript.pure.ts';

const VIDEO = 'atPa8aTd-PQ';

describe('success cases', () => {
  it('reads en and de as the spoken language, in any case', () => {
    // ARRANGE
    const expected = ['en', 'de'];
    // ACT
    const languages = [parseSpokenLanguage(' EN\n'), parseSpokenLanguage('de')];
    // ASSERT
    expect(languages).toEqual(expected);
  });

  it('names the transcript after the spoken language, in the Recording folder', () => {
    // ARRANGE
    const expected = 'recording/transcript.de.vtt';
    // ACT
    const file = transcriptFile('de');
    // ASSERT
    expect(file).toBe(expected);
  });

  it('picks the caption file of the language and skips the other language', () => {
    // ARRANGE
    const expected = `${VIDEO}.de.vtt`;
    // ACT
    const file = captionFile([`${VIDEO}.en.vtt`, `${VIDEO}.de.vtt`], VIDEO, 'de');
    // ASSERT
    expect(file).toBe(expected);
  });

  it('falls back to the original-language automatic track', () => {
    // ARRANGE
    const expected = `${VIDEO}.de-orig.vtt`;
    // ACT
    const file = captionFile([`${VIDEO}.de-orig.vtt`], VIDEO, 'de');
    // ASSERT
    expect(file).toBe(expected);
  });

  it('asks yt-dlp for the captions only, never the video', () => {
    // ARRANGE
    const dir = '/tmp/x';
    const expected = ['--skip-download', `https://www.youtube.com/watch?v=${VIDEO}`];
    // ACT
    const args = ytDlpArgs(VIDEO, 'de', dir);
    // ASSERT
    expect(args).toEqual(expect.arrayContaining(expected));
  });
});

describe('failure cases', () => {
  it('reads no language from anything but en or de', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const language = parseSpokenLanguage('fr');
    // ASSERT
    expect(language).toBe(expected);
  });

  it('finds no caption file when YouTube has none yet', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const file = captionFile([`${VIDEO}.info.json`], VIDEO, 'de');
    // ASSERT
    expect(file).toBe(expected);
  });
});

describe('edge cases', () => {
  it('ignores the caption file of another video', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const file = captionFile(['other.de.vtt'], VIDEO, 'de');
    // ASSERT
    expect(file).toBe(expected);
  });
});
