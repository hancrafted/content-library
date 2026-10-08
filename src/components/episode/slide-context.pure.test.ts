import { describe, expect, it } from 'vitest';
import { slideContext } from './slide-context.pure';

// Stands in for a catalog reader: answers with the key it was asked for, so
// the assertions pin the exact key shape (FE-010 §8).
const read = (key: string) => key;

describe('success cases', () => {
  it('reads each note and segment string from its FE-010 catalog key', () => {
    // ARRANGE
    const spec = {
      notes: [
        {
          slug: 'stateless',
          target: 'prose',
          sources: ['https://example.com/a'],
          image: { src: '/img/a.png' },
        },
      ],
      segments: [{ slug: 'blank-slate', from: 0, to: 0.75, bridge: true }],
    };
    const expectedNote = {
      slug: 'stateless',
      header: 'foundations.slides.why.notes.stateless.header',
      description: 'foundations.slides.why.notes.stateless.description',
      target: 'prose',
      sources: ['https://example.com/a'],
      image: { src: '/img/a.png', alt: 'foundations.slides.why.notes.stateless.image.alt' },
    };
    const expectedSegment = {
      slug: 'blank-slate',
      from: 0,
      to: 0.75,
      title: 'foundations.slides.why.voiceScript.segments.blank-slate.title',
      keywords: ['foundations.slides.why.voiceScript.segments.blank-slate.keywords'],
      script: 'foundations.slides.why.voiceScript.segments.blank-slate.script',
      bridge: 'foundations.slides.why.voiceScript.segments.blank-slate.bridge',
    };
    // ACT
    const context = slideContext(read, 'foundations.slides.why', spec);
    // ASSERT
    expect(context.notes).toEqual([expectedNote]);
    expect(context.voiceScript).toEqual([expectedSegment]);
  });

  it('splits a keywords string on commas and trims each', () => {
    // ARRANGE
    const keywordsRead = (key: string) => (key.endsWith('.keywords') ? 'one, two ,three' : key);
    const spec = { segments: [{ slug: 's', from: 0, to: 1 }] };
    const expected = ['one', 'two', 'three'];
    // ACT
    const [segment] = slideContext(keywordsRead, 'b', spec).voiceScript;
    // ASSERT
    expect(segment.keywords).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('returns empty lists for an empty spec', () => {
    // ARRANGE
    const spec = {};
    // ACT
    const context = slideContext(read, 'b', spec);
    // ASSERT
    expect(context).toEqual({ notes: [], voiceScript: [] });
  });
});

describe('edge cases', () => {
  it('omits the bridge, sources and image when the spec does not set them', () => {
    // ARRANGE
    const spec = { notes: [{ slug: 'n', target: 'title' }], segments: [{ slug: 's', from: 0, to: 1 }] };
    // ACT
    const context = slideContext(read, 'b', spec);
    // ASSERT
    expect(context.notes[0]).not.toHaveProperty('sources');
    expect(context.notes[0]).not.toHaveProperty('image');
    expect(context.voiceScript[0]).not.toHaveProperty('bridge');
  });
});
