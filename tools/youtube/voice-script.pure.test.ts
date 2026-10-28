import { describe, expect, it } from 'vitest';
import { cutBySlide, parseCues, readingMinutes, spokenWords } from './voice-script.pure.ts';

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

  it('counts words and minutes as design-ADR 0002 does: tags and dashes are no words, 120 per minute in German, 140 in English', () => {
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
});
