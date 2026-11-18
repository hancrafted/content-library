import { describe, expect, it } from 'vitest';
import { resolveLayers, type InstanceRecord, type InstanceSlide, type OverrideLayer } from './episode-instance.pure';
import { withoutSectionSlide, type SectionList } from './episode.pure';

function fake(slug: string, en: object, de: object): InstanceSlide {
  return { slug, messages: { en, de } };
}

const HERO = fake('hero', { goal: 'Managing it' }, { goal: 'Es managen' });
const WHY = fake(
  'why',
  { title: 'Why', steps: { one: 'One', two: 'Two' }, list: ['a', 'b'] },
  { title: 'Warum', steps: { one: 'Eins', two: 'Zwei' }, list: ['x', 'y'] },
);
const PRICE = fake('price', { title: 'Price' }, { title: 'Preis' });
const LOOP = fake('loop', { title: 'Loop' }, { title: 'Schleife' });
const HOW = fake('how', { title: 'How' }, { title: 'Wie' });
const WATCH = fake('watch', { title: 'Watch' }, { title: 'Schauen' });
const ADDED = fake('added', { title: 'Added' }, { title: 'Neu' });

const BASE: InstanceRecord = {
  slug: 'demo',
  messages: { en: { title: 'Demo' }, de: { title: 'Demo-de' } },
  title: HERO,
  sections: [
    [WHY, PRICE, LOOP],
    [HOW, WATCH],
  ],
};

const FLAGGED: InstanceRecord = {
  ...BASE,
  sections: [withoutSectionSlide([WHY, PRICE, LOOP]), [HOW, WATCH]],
};

const resolve = (base: InstanceRecord, ...layers: OverrideLayer[]) => resolveLayers(base, layers);
const slugsOf = (record: InstanceRecord) => record.sections.map((section) => section.map(({ slug }) => slug));
const flagsOf = (record: InstanceRecord) => record.sections.map((section: SectionList) => section.sectionSlide);

describe('success cases', () => {
  it('resolves no Episode override into a record equal to its Base Episode', () => {
    // ARRANGE
    const expected = BASE;
    // ACT
    const instance = resolve(BASE, {});
    // ASSERT
    expect(instance).toEqual(expected);
  });

  it('merges a Slide text override into its locale: objects by key, arrays whole, the other locale untouched', () => {
    // ARRANGE
    const expected = {
      en: { title: 'Why', steps: { one: 'First', two: 'Two' }, list: ['only'] },
      de: WHY.messages.de,
    };
    // ACT
    const instance = resolve(BASE, {
      slides: { why: { messages: { en: { steps: { one: 'First' }, list: ['only'] } } } },
    });
    // ASSERT
    expect(instance.sections[0][0].messages).toEqual(expected);
  });

  it('overrides the Title slide by its slug and replaces a Slide presentation', () => {
    // ARRANGE
    const expected = {
      hero: { en: { goal: 'Manage' }, de: HERO.messages.de },
      presentation: { tone: 'inverse' },
    };
    // ACT
    const instance = resolve(BASE, {
      slides: { hero: { messages: { en: { goal: 'Manage' } } }, price: { presentation: { tone: 'inverse' } } },
    });
    // ASSERT
    expect({ hero: instance.title?.messages, presentation: instance.sections[0][1].presentation }).toEqual(expected);
  });

  it('gives the Title notes and merges their text into the Episode text', () => {
    // ARRANGE
    const notes = [{ slug: 'check-in', target: 'title' }];
    const expected = {
      notes,
      messages: {
        en: { title: 'Demo', notes: { 'check-in': { header: 'Check-in' } } },
        de: { title: 'Demo-de', notes: { 'check-in': { header: 'Check-in-de' } } },
      },
    };
    // ACT
    const instance = resolve(BASE, {
      title: {
        notes,
        messages: {
          en: { notes: { 'check-in': { header: 'Check-in' } } },
          de: { notes: { 'check-in': { header: 'Check-in-de' } } },
        },
      },
    });
    // ASSERT
    expect({ notes: instance.notes, messages: instance.messages }).toEqual(expected);
  });

  it('moves, hides and inserts Slides by slug, so the base keeps reaching the instance', () => {
    // ARRANGE
    const expected = [
      ['why', 'loop', 'price'],
      ['how', 'added'],
    ];
    // ACT
    const instance = resolve(BASE, {
      sections: [{ move: 'price', after: 'loop' }, { hide: 'watch' }, { insert: ADDED, after: 'how' }],
    });
    // ASSERT
    expect(slugsOf(instance)).toEqual(expected);
  });

  it('applies layers in order, a later layer over an earlier one', () => {
    // ARRANGE
    const expected = { title: 'Last', steps: { one: 'One', two: 'Two' }, list: ['a', 'b'] };
    // ACT
    const instance = resolve(
      BASE,
      { slides: { why: { messages: { en: { title: 'First' } } } } },
      { slides: { why: { messages: { en: { title: 'Last' } } } } },
    );
    // ASSERT
    expect(instance.sections[0][0].messages.en).toEqual(expected);
  });

  it('runs Section operations before Slide overrides, so a layer overrides a Slide it inserts', () => {
    // ARRANGE
    const expected = { en: { title: 'Added here' }, de: ADDED.messages.de };
    // ACT
    const instance = resolve(BASE, {
      sections: [{ insert: ADDED, after: 'how' }],
      slides: { added: { messages: { en: { title: 'Added here' } } } },
    });
    // ASSERT
    expect(instance.sections[1][1].messages).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a Slide override for a Slide the record does not compose', () => {
    // ARRANGE
    const expected = 'Slide "stray" is not in the Base Episode "demo"';
    // ACT
    const resolving = () => resolve(BASE, { slides: { stray: { messages: { en: { title: 'x' } } } } });
    // ASSERT
    expect(resolving).toThrow(expected);
  });

  it('refuses a Section operation naming a Slide the record does not compose', () => {
    // ARRANGE
    const expected = 'Slide "stray" is not in the Base Episode "demo"';
    // ACT
    const resolving = () => resolve(BASE, { sections: [{ move: 'stray', after: 'why' }] });
    // ASSERT
    expect(resolving).toThrow(expected);
  });

  it('refuses to move a section slide, which names its Section and its anchors', () => {
    // ARRANGE
    const expected = 'Slide "how" opens a Section: hide the Section instead of moving it';
    // ACT
    const resolving = () => resolve(BASE, { sections: [{ move: 'how', after: 'loop' }] });
    // ASSERT
    expect(resolving).toThrow(expected);
  });

  it('refuses to insert a Slide whose slug the Episode already composes', () => {
    // ARRANGE
    const expected = 'Slide "watch" is already in the Base Episode "demo"';
    // ACT
    const resolving = () => resolve(BASE, { sections: [{ insert: WATCH, after: 'why' }] });
    // ASSERT
    expect(resolving).toThrow(expected);
  });

  it('refuses to move the Slide that stands in at the anchor of a Section without a section slide', () => {
    // ARRANGE
    const expected = 'Slide "price" opens a Section: hide the Section instead of moving it';
    // ACT
    const resolving = () => resolve(FLAGGED, { sections: [{ move: 'price', after: 'watch' }] });
    // ASSERT
    expect(resolving).toThrow(expected);
  });

  it.each([
    ['inserts', { insert: ADDED, after: 'why' }],
    ['moves', { move: 'watch', after: 'why' }],
  ] as const)(
    'refuses an operation that %s a Slide in front of the opener of a Section without a section slide',
    (_, operation) => {
      // ARRANGE
      const expected = 'would take over the anchor of the Section "why" from "price"';
      // ACT
      const resolving = () => resolve(FLAGGED, { sections: [operation] });
      // ASSERT
      expect(resolving).toThrow(expected);
    },
  );
});

describe('edge cases', () => {
  it('keeps a Section without a section slide flagged as one through every operation', () => {
    // ARRANGE
    const expected = [false, undefined];
    // ACT
    const instance = resolve(FLAGGED, {
      sections: [
        { move: 'watch', after: 'loop' },
        { insert: ADDED, after: 'price' },
      ],
      slides: { loop: { messages: { en: { title: 'Loop!' } } } },
    });
    // ASSERT
    expect({ slugs: slugsOf(instance), flags: flagsOf(instance) }).toEqual({
      slugs: [['why', 'price', 'added', 'loop', 'watch'], ['how']],
      flags: expected,
    });
  });

  it('hides a whole Section when the hidden Slide is its section slide', () => {
    // ARRANGE
    const expected = [['why', 'price', 'loop']];
    // ACT
    const instance = resolve(BASE, { sections: [{ hide: 'how' }] });
    // ASSERT
    expect(slugsOf(instance)).toEqual(expected);
  });

  it('hides a whole Section without a section slide when the hidden Slide is its opener, so its hidden head never renders', () => {
    // ARRANGE
    const lone: InstanceRecord = { ...BASE, sections: [withoutSectionSlide([WHY, PRICE]), [HOW, WATCH]] };
    const expected = [['how', 'watch']];
    // ACT
    const instance = resolve(lone, { sections: [{ hide: 'price' }] });
    // ASSERT
    expect(slugsOf(instance)).toEqual(expected);
  });

  it('keeps the Base Episode and its Slides unchanged', () => {
    // ARRANGE
    const before = structuredClone({ messages: BASE.messages, sections: slugsOf(BASE), why: WHY.messages });
    // ACT
    resolve(BASE, {
      title: { messages: { en: { title: 'Changed' } } },
      slides: { why: { messages: { en: { title: 'Changed' } } } },
      sections: [{ hide: 'watch' }],
    });
    // ASSERT
    expect({ messages: BASE.messages, sections: slugsOf(BASE), why: WHY.messages }).toEqual(before);
  });

  it('accepts an override of a Slide the same layer hides, and drops it with the Slide', () => {
    // ARRANGE
    const expected = [['why', 'price', 'loop'], ['how']];
    // ACT
    const instance = resolve(BASE, {
      sections: [{ hide: 'watch' }],
      slides: { watch: { messages: { en: { title: 'Gone' } } } },
    });
    // ASSERT
    expect(slugsOf(instance)).toEqual(expected);
  });
});
