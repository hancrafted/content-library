import { describe, expect, it } from 'vitest';
import { episode, headerModeOf, slide, type OwnSlideKit, type Section } from './slide';
import type { RuntimeKit } from './slide-base';

/*
 * The Slide's typing is its contract: each `@ts-expect-error`
 * below is a proof `npm run typecheck` holds — if the line stopped failing, tsc
 * reports the unused directive. The messages stand in for a Slide's own
 * `i18n/en.json` and `i18n/de.json`, typed as a JSON import types them.
 */
const EN = {
  title: 'Why every Episode starts from a copy',
  prose: 'A <ref>reference Episode</ref> keeps the shape.',
  spine: { next: 'Next level' },
  notes: { 'reference-episode': { header: 'Why a reference Episode', description: 'Point at the prose.' } },
  voiceScript: { segments: { 'one-breath': { title: 'In one breath', keywords: 'shape', script: 'Copy it.' } } },
};
const DE: typeof EN = {
  title: 'Warum jede Episode als Kopie beginnt',
  prose: 'Eine <ref>Referenz-Episode</ref> hält die Form.',
  spine: { next: 'Nächste Ebene' },
  notes: { 'reference-episode': { header: 'Warum eine Referenz-Episode', description: 'Auf den Text zeigen.' } },
  voiceScript: { segments: { 'one-breath': { title: 'In einem Atemzug', keywords: 'Form', script: 'Kopieren.' } } },
};
const UNTITLED = { en: { statement: 'Now replace the words.' }, de: { statement: 'Jetzt die Wörter ersetzen.' } };

/** A kit that records what a Slide asked for, standing in for the container's. */
function recordingKit(): { kit: RuntimeKit; calls: string[] } {
  const calls: string[] = [];
  const t = Object.assign((key: string) => (calls.push(`t:${key}`), key), {
    rich: (key: string) => (calls.push(`rich:${key}`), key),
    markup: (key: string) => key,
    raw: (key: string) => key,
    has: () => true,
  });
  const kit: RuntimeKit = {
    t,
    locale: 'en',
    slideHref: (slug) => (calls.push(`slideHref:${slug}`), `#${slug}`),
    template: (key) => (calls.push(`template:${key}`), key),
    ref: (note) => (calls.push(`ref:${note}`), (chunks) => chunks),
    marker: (note) => (calls.push(`marker:${note}`), (chunks) => chunks),
    Marker: ({ note }) => (calls.push(`Marker:${note}`), null as never),
    target: (name) => (calls.push(`target:${name}`), { 'data-target': name }),
    Title: () => null as never,
  };
  return { kit, calls };
}

const whyATemplate = slide({
  slug: 'why-a-template',
  messages: { en: EN, de: DE },
  notes: [{ slug: 'reference-episode', target: 'prose' }],
  segments: [{ slug: 'one-breath' }],
  content: ({ t, ref, marker, Marker, target, slideHref, template }) => {
    t('title');
    ref('reference-episode');
    marker('reference-episode');
    Marker({ note: 'reference-episode' });
    target('prose');
    slideHref('any-slide-of-the-episode');
    template('spine.next');
    return null;
  },
});

describe('success cases', () => {
  it('keeps what a Slide declares, its own text included, and renders its Scene from the kit it is given', () => {
    // ARRANGE
    const { kit, calls } = recordingKit();
    const expected = [
      't:title',
      'ref:reference-episode',
      'marker:reference-episode',
      'Marker:reference-episode',
      'target:prose',
      'slideHref:any-slide-of-the-episode',
      'template:spine.next',
    ];
    // ACT
    whyATemplate.content(kit);
    // ASSERT
    expect(whyATemplate).toMatchObject({
      slug: 'why-a-template',
      messages: { en: EN, de: DE },
      notes: [{ slug: 'reference-episode', target: 'prose' }],
      segments: [{ slug: 'one-breath' }],
    });
    expect(calls).toEqual(expected);
  });

  it('composes an Episode that carries its own text from Sections whose first Slide is titled', () => {
    // ARRANGE
    const head = slide({ slug: 'foundations', messages: { en: EN, de: DE }, content: ({ t }) => t('title') });
    const tail = slide({ slug: 'what-comes-next', messages: UNTITLED, content: ({ t }) => t('statement') });
    const sections: Section[] = [[head, tail]];
    const messages = {
      en: { title: 'Page template', caption: 'The smallest Episode.', description: 'Copy it.' },
      de: { title: 'Seitenvorlage', caption: 'Die kleinste Episode.', description: 'Kopieren.' },
    };
    // ACT
    const record = episode({ slug: 'page-template', messages, sections });
    // ASSERT
    expect(record.sections).toBe(sections);
    expect(record.messages).toBe(messages);
  });

  it('puts an Episode on the shared Slide header unless its record says otherwise', () => {
    // ARRANGE
    const record = {};
    const expected = 'shared';
    // ACT
    const mode = headerModeOf(record);
    // ASSERT
    expect(mode).toBe(expected);
  });
});

describe('failure cases', () => {
  it('rejects at compile time what the Slide does not back with its own files', () => {
    // ARRANGE
    const bad = () => [
      slide({
        slug: 'why-a-template',
        messages: { en: EN, de: DE },
        notes: [{ slug: 'reference-episode', target: 'prose' }],
        content: ({ t, ref, marker, Marker, target, template }) => {
          // @ts-expect-error -- a key outside this Slide's own file
          t('statement');
          // @ts-expect-error -- a subtree, not a string leaf
          template('spine');
          // @ts-expect-error -- a note this Slide does not declare
          ref('no-such-note');
          // @ts-expect-error -- a marker for a note this Slide does not declare
          marker('no-such-note');
          // @ts-expect-error -- an element marker for a note this Slide does not declare
          Marker({ note: 'no-such-note' });
          // @ts-expect-error -- a target no note of this Slide names
          target('caption');
          return null;
        },
      }),
      slide({
        slug: 'why-a-template',
        // @ts-expect-error -- German lacks a key English has: untranslated text never ships
        messages: { en: EN, de: { ...DE, title: undefined } },
        content: () => null,
      }),
      slide({
        slug: 'why-a-template',
        // @ts-expect-error -- German lacks the whole `spine` subtree
        messages: { en: EN, de: { title: DE.title, prose: DE.prose, notes: DE.notes, voiceScript: DE.voiceScript } },
        content: () => null,
      }),
      slide({
        slug: 'what-comes-next',
        messages: UNTITLED,
        // @ts-expect-error -- `statement` alone translates no notes
        notes: [{ slug: 'x', target: 'title' }],
        content: () => null,
      }),
      // @ts-expect-error -- a segment the Slide's own Voice script does not translate
      slide({ slug: 'why-a-template', messages: { en: EN, de: DE }, segments: [{ slug: 'two' }], content: () => null }),
    ];
    // ACT
    const built = typeof bad;
    // ASSERT
    expect(built).toBe('function');
  });

  it('lets only a Slide whose own file holds a title open a Section', () => {
    // ARRANGE
    const untitled = slide({ slug: 'what-comes-next', messages: UNTITLED, content: () => null });
    // @ts-expect-error -- an untitled Slide cannot name a Section
    const sections: Section[] = [[untitled]];
    // ACT
    const opener = sections[0][0].slug;
    // ASSERT
    expect(opener).toBe(untitled.slug);
  });

  it("leaves the header to each Scene when the record sets header: 'authored'", () => {
    // ARRANGE
    const record = { header: 'authored' } as const;
    const expected = 'authored';
    // ACT
    const mode = headerModeOf(record);
    // ASSERT
    expect(mode).toBe(expected);
  });
});

describe('edge cases', () => {
  it('accepts the runtime kit wherever a typed Slide kit is expected, so the erasure is sound', () => {
    // ARRANGE
    type WhyKit = OwnSlideKit<typeof EN, { slug: 'reference-episode'; target: 'prose' }>;
    const { kit } = recordingKit();
    // ACT
    const typed: WhyKit = kit;
    // ASSERT
    expect(typed).toBe(kit);
  });

  it('defaults notes and segments to none', () => {
    // ARRANGE
    const expected = { slug: 'what-comes-next', messages: UNTITLED, notes: [], segments: [] };
    // ACT
    const { content, ...data } = slide({ slug: 'what-comes-next', messages: UNTITLED, content: () => null });
    // ASSERT
    expect(data).toEqual(expected);
    expect(typeof content).toBe('function');
  });
});
