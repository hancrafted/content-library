import { describe, expect, it } from 'vitest';
import {
  cutBySlide,
  overrideFileOf,
  parseCues,
  readingMinutes,
  spokenWords,
  writeSurface,
} from './voice-script.pure.ts';

const VTT = `WEBVTT
Kind: captions
Language: de

00:00:01.599 --> 00:00:04.390 align:start position:0%
 
Gut,<00:00:01.959><c> also</c><00:00:02.159><c> in</c><00:00:02.320><c> dieser</c><00:00:02.520><c> Episode</c>

00:00:04.390 --> 00:00:04.400 align:start position:0%
Gut, also in dieser Episode
 

00:00:04.400 --> 00:00:07.590 align:start position:0%
Gut, also in dieser Episode
warum<00:00:05.040><c> KI</c><00:00:05.839><c> vergisst</c>

00:00:07.590 --> 00:00:07.600 align:start position:0%
warum KI vergisst
 

00:01:05.000 --> 00:01:08.000 align:start position:0%
warum KI vergisst
und<00:01:05.500><c> weiter</c>
`;

describe('success cases', () => {
  it('reads each caption line once, at the second it first appears, without the rolling repeats and timing tags', () => {
    // ARRANGE
    const expected = [
      { start: 1.599, text: 'Gut, also in dieser Episode' },
      { start: 4.4, text: 'warum KI vergisst' },
      { start: 65, text: 'und weiter' },
    ];
    // ACT
    const found = parseCues(VTT);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('cuts the transcript at each matched Slide start and hands a window to the Slide before the next start', () => {
    // ARRANGE
    const cues = parseCues(VTT);
    const slides = ['hero', 'middle', 'outro'];
    const starts = { hero: 0, middle: 4, outro: 60 };
    const expected = { hero: 'Gut, also in dieser Episode', middle: 'warum KI vergisst', outro: 'und weiter' };
    // ACT
    const found = cutBySlide(cues, slides, starts);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('gives an unmatched Slide no speech and lets the Slide before it run on to the next matched start', () => {
    // ARRANGE
    const cues = parseCues(VTT);
    const slides = ['hero', 'skipped', 'outro'];
    const starts = { hero: 0, outro: 60 };
    const expected = { hero: 'Gut, also in dieser Episode warum KI vergisst', skipped: '', outro: 'und weiter' };
    // ACT
    const found = cutBySlide(cues, slides, starts);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('counts words and minutes as Decision record 0002 does: tags and dashes are no words, 120 per minute in German, 140 in English', () => {
    // ARRANGE
    const scripts = ['Eins <b>zwei</b> drei – vier.', 'fünf sechs'];
    const expected = { words: 6, de: 6 / 120, en: 6 / 140 };
    // ACT
    const found = {
      words: spokenWords(scripts),
      de: readingMinutes(scripts, 'de'),
      en: readingMinutes(scripts, 'en'),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('points an Episode instance at the Slide override file, never at the Base Episode i18n, pool Slide or not', () => {
    // ARRANGE
    const row = { slug: 'the-hook', files: ['src/episodes/base/slides/the-hook/i18n/de.json'], pool: true };
    // ACT
    const found = writeSurface(row, 'de', true);
    // ASSERT
    expect(found).toContain(overrideFileOf('the-hook', 'de'));
    expect(found).not.toContain('POOL');
  });
});

describe('failure cases', () => {
  it('says an inline override in episode.ts also applies to an instance Slide, so the writer does not miss it', () => {
    // ARRANGE
    const row = { slug: 'the-hook', files: [], pool: false, inline: 1 };
    // ACT
    const found = writeSurface(row, 'de', true);
    // ASSERT
    expect(found).toContain('inline override in episode.ts');
  });

  it('still flags a Slide with no i18n file when the Episode is no instance', () => {
    // ARRANGE
    const row = { slug: 'orphan', files: [], pool: false };
    // ACT
    const found = writeSurface(row, 'de', false);
    // ASSERT
    expect(found).toBe('NO I18N FILE');
  });
});

describe('edge cases', () => {
  it('names the override file by Slide slug and spoken language, and keeps a Slide start of 0 as a start', () => {
    // ARRANGE
    const expected = 'overrides/the-hook.en.json';
    // ACT
    const found = overrideFileOf('the-hook', 'en');
    // ASSERT
    expect(found).toBe(expected);
    expect(cutBySlide([{ start: 0, text: 'a' }], ['s'], { s: 0 })).toEqual({ s: 'a' });
  });
});
