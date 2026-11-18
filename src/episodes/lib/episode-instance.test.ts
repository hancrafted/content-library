import { describe, expect, it } from 'vitest';
import { baseOf, instanceOf, overrideSlide } from './episode-instance';
import { withoutSectionSlide, type SectionList } from './episode.pure';

interface FakeSlide<S extends string = string, M extends object = object> {
  readonly slug: S;
  readonly messages: { readonly en: M; readonly de: M };
  readonly presentation?: { readonly tone?: 'inverse' };
}

interface FakeEpisode {
  readonly slug: 'demo';
  readonly messages: {
    readonly en: { readonly title: string; readonly notes?: Readonly<Record<string, unknown>> };
    readonly de: { readonly title: string; readonly notes?: Readonly<Record<string, unknown>> };
  };
  readonly notes?: readonly { readonly slug: string; readonly target: string }[];
  readonly title?: FakeSlide;
  readonly sections: readonly SectionList<FakeSlide>[];
}

function fake<const S extends string, M extends object>(slug: S, en: M, de: M): FakeSlide<S, M> {
  return { slug, messages: { en, de } };
}

const HERO = fake('hero', { goal: 'Managing it' }, { goal: 'Es managen' });
const WHY = fake(
  'why',
  { title: 'Why', steps: { one: 'One', two: 'Two' }, list: ['a', 'b'] },
  {
    title: 'Warum',
    steps: { one: 'Eins', two: 'Zwei' },
    list: ['x', 'y'],
  },
);
const PRICE = fake('price', { title: 'Price' }, { title: 'Preis' });
const LOOP = fake('loop', { title: 'Loop' }, { title: 'Schleife' });
const HOW = fake('how', { title: 'How' }, { title: 'Wie' });
const WATCH = fake('watch', { title: 'Watch' }, { title: 'Schauen' });

const BASE: FakeEpisode = {
  slug: 'demo',
  messages: { en: { title: 'Demo' }, de: { title: 'Demo-de' } },
  title: HERO,
  sections: [
    [WHY, PRICE, LOOP],
    [HOW, WATCH],
  ],
};

const slugsOf = (record: FakeEpisode) => record.sections.map((section) => section.map(({ slug }) => slug));

describe('success cases', () => {
  it('resolves an instance with no Episode override into a record equal to its Base Episode', () => {
    // ARRANGE
    const expected = BASE;
    // ACT
    const instance = instanceOf(BASE, {});
    // ASSERT
    expect(instance).toEqual(expected);
  });

  it('remembers the Base Episode an instance resolves from, through every layer', () => {
    // ARRANGE
    const first = instanceOf(BASE, {});
    // ACT
    const bases = [baseOf(first), baseOf(instanceOf(first, {})), baseOf(BASE)];
    // ASSERT
    expect(bases).toEqual([BASE, BASE, undefined]);
    expect(baseOf(first)).toBe(BASE);
  });

  it('merges a Slide text override into its locale: objects by key, arrays whole, the other locale untouched', () => {
    // ARRANGE
    const expected = {
      en: { title: 'Why', steps: { one: 'First', two: 'Two' }, list: ['only'] },
      de: WHY.messages.de,
    };
    // ACT
    const instance = instanceOf(BASE, {
      slides: [overrideSlide(WHY, { messages: { en: { steps: { one: 'First' }, list: ['only'] } } })],
    });
    // ASSERT
    expect(instance.sections[0][0].messages).toEqual(expected);
  });

  it('overrides the Title slide and replaces a Slide presentation', () => {
    // ARRANGE
    const expected = {
      hero: { en: { goal: 'Manage' }, de: HERO.messages.de },
      presentation: { tone: 'inverse' },
    };
    // ACT
    const instance = instanceOf(BASE, {
      slides: [
        overrideSlide(HERO, { messages: { en: { goal: 'Manage' } } }),
        overrideSlide(PRICE, { presentation: { tone: 'inverse' } }),
      ],
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
    const instance = instanceOf(BASE, {
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
    const added = fake('added', { title: 'Added' }, { title: 'Neu' });
    const expected = [
      ['why', 'loop', 'price'],
      ['how', 'added'],
    ];
    // ACT
    const instance = instanceOf(BASE, {
      sections: [{ move: PRICE, after: LOOP }, { hide: WATCH }, { insert: added, after: HOW }],
    });
    // ASSERT
    expect(slugsOf(instance)).toEqual(expected);
  });

  it('applies layers in order, a later layer over an earlier one', () => {
    // ARRANGE
    const expected = { title: 'Last', steps: { one: 'One', two: 'Two' }, list: ['a', 'b'] };
    // ACT
    const instance = instanceOf(
      BASE,
      { slides: [overrideSlide(WHY, { messages: { en: { title: 'First' } } })] },
      { slides: [overrideSlide(WHY, { messages: { en: { title: 'Last' } } })] },
    );
    // ASSERT
    expect(instance.sections[0][0].messages.en).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses an Episode override for a Slide its base does not compose', () => {
    // ARRANGE
    const stray = fake('stray', { title: 'Stray' }, { title: 'Streuner' });
    const expected = 'Slide "stray" is not in the Base Episode "demo"';
    // ACT
    const resolve = () => instanceOf(BASE, { slides: [overrideSlide(stray, { messages: { en: { title: 'x' } } })] });
    // ASSERT
    expect(resolve).toThrow(expected);
  });

  it('refuses a Section operation naming a Slide its base does not compose', () => {
    // ARRANGE
    const stray = fake('stray', { title: 'Stray' }, { title: 'Streuner' });
    const expected = 'Slide "stray" is not in the Base Episode "demo"';
    // ACT
    const resolve = () => instanceOf(BASE, { sections: [{ move: stray, after: WHY }] });
    // ASSERT
    expect(resolve).toThrow(expected);
  });

  it('refuses to move a section slide, which names its Section and its anchors', () => {
    // ARRANGE
    const expected = 'Slide "how" opens a Section: hide the Section instead of moving it';
    // ACT
    const resolve = () => instanceOf(BASE, { sections: [{ move: HOW, after: LOOP }] });
    // ASSERT
    expect(resolve).toThrow(expected);
  });

  it('refuses to insert a Slide whose slug the Episode already composes', () => {
    // ARRANGE
    const expected = 'Slide "watch" is already in the Base Episode "demo"';
    // ACT
    const resolve = () => instanceOf(BASE, { sections: [{ insert: WATCH, after: WHY }] });
    // ASSERT
    expect(resolve).toThrow(expected);
  });

  it('makes an unknown key, an unknown nested key, an imported partial with an unknown key and a value of another type compile errors', () => {
    // ARRANGE
    const renamed = { titel: 'Typo' };
    const expected = ['why', 'why', 'why', 'why'];
    // ACT
    const overrides = [
      // @ts-expect-error
      overrideSlide(WHY, { messages: { en: { heading: 'Typo' } } }),
      // @ts-expect-error
      overrideSlide(WHY, { messages: { de: { steps: { three: 'Drei' } } } }),
      // @ts-expect-error
      overrideSlide(WHY, { messages: { en: renamed } }),
      // @ts-expect-error
      overrideSlide(WHY, { messages: { en: { list: 'not an array' } } }),
    ];
    // ASSERT
    expect(overrides.map(({ slug }) => slug)).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps a Section without a section slide flagged as one through every operation', () => {
    // ARRANGE
    const flagged: FakeEpisode = { ...BASE, sections: [withoutSectionSlide([WHY, PRICE, LOOP])] };
    const expected = false;
    // ACT
    const instance = instanceOf(flagged, { sections: [{ move: PRICE, after: LOOP }] });
    // ASSERT
    expect(instance.sections[0].sectionSlide).toBe(expected);
  });

  it('hides a whole Section when the hidden Slide is its section slide', () => {
    // ARRANGE
    const expected = [['why', 'price', 'loop']];
    // ACT
    const instance = instanceOf(BASE, { sections: [{ hide: HOW }] });
    // ASSERT
    expect(slugsOf(instance)).toEqual(expected);
  });

  it('leaves the Base Episode and its Slides unchanged', () => {
    // ARRANGE
    const before = structuredClone({ messages: BASE.messages, sections: slugsOf(BASE), why: WHY.messages });
    // ACT
    instanceOf(BASE, {
      title: { messages: { en: { title: 'Changed' } } },
      slides: [overrideSlide(WHY, { messages: { en: { title: 'Changed' } } })],
      sections: [{ hide: WATCH }],
    });
    // ASSERT
    expect({ messages: BASE.messages, sections: slugsOf(BASE), why: WHY.messages }).toEqual(before);
  });
});
