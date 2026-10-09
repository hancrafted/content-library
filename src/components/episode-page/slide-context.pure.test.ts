import { describe, expect, it } from 'vitest';
import { slideContext, slideMinutes } from './slide-context.pure';

// Stands in for a Translation file reader: answers with the key it was asked for, so
// the assertions pin the exact key shape (FE-010 §6).
const read = (key: string) => key;

describe('success cases', () => {
  it('reads each note and segment string from its FE-010 Translation key, relative to the Slide', () => {
    // ARRANGE
    const spec = {
      notes: [
        {
          slug: 'stateless',
          target: 'prose',
          sources: [{ slug: 'spec', url: 'https://example.com/a' }],
          image: { src: '/img/a.png' },
        },
      ],
      segments: [{ slug: 'blank-slate', bridge: true }],
    };
    const expectedNote = {
      slug: 'stateless',
      header: 'notes.stateless.header',
      description: 'notes.stateless.description',
      target: 'prose',
      sources: [
        {
          slug: 'spec',
          url: 'https://example.com/a',
          title: 'notes.stateless.sources.spec.title',
        },
      ],
      image: { src: '/img/a.png', alt: 'notes.stateless.image.alt' },
    };
    const expectedSegment = {
      slug: 'blank-slate',
      from: 0,
      to: expect.any(Number),
      title: 'voiceScript.segments.blank-slate.title',
      keywords: ['voiceScript.segments.blank-slate.keywords'],
      script: 'voiceScript.segments.blank-slate.script',
      bridge: 'voiceScript.segments.blank-slate.bridge',
    };
    // ACT
    const context = slideContext(read, spec, 'en');
    // ASSERT
    expect(context.notes).toEqual([expectedNote]);
    expect(context.voiceScript).toEqual([expectedSegment]);
  });

  it.each([
    ['en', [0, 1, 1, 2]],
    ['de', [0, 7 / 6, 7 / 6, 14 / 6]],
  ] as const)('times each segment from its translated script and bridge, in %s', (locale, expected) => {
    // ARRANGE
    const words = (count: number) => Array.from({ length: count }, () => 'wort').join(' ');
    const scripted = (key: string) =>
      key.endsWith('.script') ? words(100) : key.endsWith('.bridge') ? words(40) : key;
    const spec = {
      segments: [
        { slug: 'a', bridge: true },
        { slug: 'b', bridge: true },
      ],
    };
    // ACT
    const spans = slideContext(scripted, spec, locale).voiceScript.flatMap(({ from, to }) => [from, to]);
    // ASSERT
    spans.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));
  });

  it("ends a Slide's minutes where its last segment ends", () => {
    // ARRANGE
    const words = (count: number) => Array.from({ length: count }, () => 'word').join(' ');
    const scripted = (key: string) => (key.endsWith('.script') ? words(70) : key);
    const spec = { segments: [{ slug: 'a' }, { slug: 'b' }] };
    const expected = 1;
    // ACT
    const { minutes } = slideContext(scripted, spec, 'en');
    // ASSERT
    expect(minutes).toBe(expected);
  });

  it('counts minutes from the Voice script alone, reading only its script and bridge keys', () => {
    // ARRANGE
    const asked: string[] = [];
    const words = (count: number) => Array.from({ length: count }, () => 'wort').join(' ');
    // 100 + 20 words, then 120: 240 words at 120 a minute.
    const scripted = (key: string) => (
      asked.push(key),
      words(key.endsWith('a.script') ? 100 : key.endsWith('a.bridge') ? 20 : 120)
    );
    const spec = { segments: [{ slug: 'a', bridge: true }, { slug: 'b' }] };
    const expected = {
      minutes: 2,
      asked: ['voiceScript.segments.a.script', 'voiceScript.segments.a.bridge', 'voiceScript.segments.b.script'],
    };
    // ACT
    const minutes = slideMinutes(scripted, spec, 'de');
    // ASSERT
    expect({ minutes, asked }).toEqual(expected);
  });

  it('splits a keywords string on commas and trims each', () => {
    // ARRANGE
    const keywordsRead = (key: string) => (key.endsWith('.keywords') ? 'one, two ,three' : key);
    const spec = { segments: [{ slug: 's' }] };
    const expected = ['one', 'two', 'three'];
    // ACT
    const [segment] = slideContext(keywordsRead, spec, 'en').voiceScript;
    // ASSERT
    expect(segment.keywords).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each([
    ['an empty string', ''],
    ['only separators and blanks', ' , ,'],
  ])('yields no keywords for %s', (_label, raw) => {
    // ARRANGE
    const keywordsRead = (key: string) => (key.endsWith('.keywords') ? raw : key);
    const spec = { segments: [{ slug: 's' }] };
    const expected: string[] = [];
    // ACT
    const [segment] = slideContext(keywordsRead, spec, 'en').voiceScript;
    // ASSERT
    expect(segment.keywords).toEqual(expected);
  });

  it('drops empty entries between real keywords', () => {
    // ARRANGE
    const keywordsRead = (key: string) => (key.endsWith('.keywords') ? 'a,, b,' : key);
    const spec = { segments: [{ slug: 's' }] };
    const expected = ['a', 'b'];
    // ACT
    const [segment] = slideContext(keywordsRead, spec, 'en').voiceScript;
    // ASSERT
    expect(segment.keywords).toEqual(expected);
  });

  it('returns empty lists and no minutes for a Slide without notes or a Voice script', () => {
    // ARRANGE
    const spec = {};
    const expected = { notes: [], voiceScript: [], minutes: 0 };
    // ACT
    const context = slideContext(read, spec, 'en');
    // ASSERT
    expect(context).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('omits the bridge, sources and image when the spec does not set them', () => {
    // ARRANGE
    const spec = { notes: [{ slug: 'n', target: 'title' }], segments: [{ slug: 's' }] };
    const [absentSources, absentImage, absentBridge] = ['sources', 'image', 'bridge'];
    // ACT
    const context = slideContext(read, spec, 'en');
    // ASSERT
    expect(context.notes[0]).not.toHaveProperty(absentSources);
    expect(context.notes[0]).not.toHaveProperty(absentImage);
    expect(context.voiceScript[0]).not.toHaveProperty(absentBridge);
  });
});
