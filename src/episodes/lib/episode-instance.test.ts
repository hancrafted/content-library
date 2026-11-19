import { describe, expect, it } from 'vitest';
import { baseOf, instanceOf, instanceTrailOf } from './episode-instance';
import type { SectionList } from './episode.pure';

interface WhyMessages {
  readonly title: string;
  readonly steps: { readonly one: string; readonly two: string };
  readonly list: string[];
}

declare module './episode-instance' {
  interface BaseSlideMessages {
    'episode-instance-demo': {
      readonly hero: { readonly en: { readonly goal: string }; readonly de: { readonly goal: string } };
      readonly why: { readonly en: WhyMessages; readonly de: WhyMessages };
      readonly price: { readonly en: { readonly title: string }; readonly de: { readonly title: string } };
    };
  }
}

interface FakeSlide {
  readonly slug: string;
  readonly messages: { readonly en: object; readonly de: object };
  readonly presentation?: { readonly inverse?: boolean };
}

interface FakeEpisode {
  readonly slug: 'episode-instance-demo';
  readonly messages: {
    readonly en: { readonly title: string; readonly notes?: Readonly<Record<string, unknown>> };
    readonly de: { readonly title: string; readonly notes?: Readonly<Record<string, unknown>> };
  };
  readonly notes?: readonly { readonly slug: string; readonly target: string }[];
  readonly title?: FakeSlide;
  readonly sections: readonly SectionList<FakeSlide>[];
}

const HERO: FakeSlide = { slug: 'hero', messages: { en: { goal: 'Managing it' }, de: { goal: 'Es managen' } } };
const WHY: FakeSlide = {
  slug: 'why',
  messages: {
    en: { title: 'Why', steps: { one: 'One', two: 'Two' }, list: ['a', 'b'] },
    de: { title: 'Warum', steps: { one: 'Eins', two: 'Zwei' }, list: ['x', 'y'] },
  },
};
const PRICE: FakeSlide = { slug: 'price', messages: { en: { title: 'Price' }, de: { title: 'Preis' } } };

const BASE: FakeEpisode = {
  slug: 'episode-instance-demo',
  messages: { en: { title: 'Demo' }, de: { title: 'Demo-de' } },
  title: HERO,
  sections: [[WHY, PRICE]],
};

describe('success cases', () => {
  it('overrides a Slide by its slug, typed from the generated map, without importing the Slide', () => {
    // ARRANGE
    const expected = { title: 'Why', steps: { one: 'First', two: 'Two' }, list: ['only'] };
    // ACT
    const instance = instanceOf(BASE, {
      slides: { why: { messages: { en: { steps: { one: 'First' }, list: ['only'] } } } },
    });
    // ASSERT
    expect(instance.sections[0][0].messages.en).toEqual(expected);
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

  it('keeps the layers of every instanceOf call in order, so tools trace each text to its file', () => {
    // ARRANGE
    const outer = { title: { messages: { en: { title: 'Outer' } } } };
    const inner = { slides: { price: { messages: { de: { title: 'Innen' } } } } };
    // ACT
    const trail = instanceTrailOf(instanceOf(instanceOf(BASE, inner), outer));
    // ASSERT
    expect(trail?.base).toBe(BASE);
    expect(trail?.layers).toEqual([inner, outer]);
  });
});

describe('failure cases', () => {
  it('makes an unknown slug, an unknown key, an unknown nested key and a value of another type compile errors', () => {
    // ARRANGE
    const expected = 'Slide "stray" is not in the Base Episode "episode-instance-demo"';
    // ACT
    const resolve = () =>
      instanceOf(BASE, {
        slides: {
          // @ts-expect-error
          stray: { messages: { en: { title: 'x' } } },
        },
      });
    const typed = () => [
      // @ts-expect-error
      instanceOf(BASE, { slides: { why: { messages: { en: { heading: 'Typo' } } } } }),
      // @ts-expect-error
      instanceOf(BASE, { slides: { why: { messages: { de: { steps: { three: 'Drei' } } } } } }),
      // @ts-expect-error
      instanceOf(BASE, { slides: { why: { messages: { en: { list: 'not an array' } } } } }),
    ];
    // ASSERT
    expect(resolve).toThrow(expected);
    expect(typed).toBeTypeOf('function');
  });

  it('makes an imported partial with an unknown key a compile error, for a Slide and for the Title text', () => {
    // ARRANGE
    const renamed = { titel: 'Typo' };
    const expected = 'function';
    // ACT
    const typed = () => [
      // @ts-expect-error
      instanceOf(BASE, { slides: { price: { messages: { en: renamed } } } }),
      // @ts-expect-error
      instanceOf(BASE, { title: { messages: { de: renamed } } }),
    ];
    // ASSERT
    expect(typed).toBeTypeOf(expected);
  });

  it('makes a Section operation naming a slug the base does not compose a compile error', () => {
    // ARRANGE
    const expected = 'Slide "typo" is not in the Base Episode "episode-instance-demo"';
    // ACT
    const resolve = () =>
      // @ts-expect-error
      instanceOf(BASE, { sections: [{ hide: 'typo' }] });
    // ASSERT
    expect(resolve).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('overrides the Title slide by its slug, the same way as a Section Slide', () => {
    // ARRANGE
    const expected = { en: { goal: 'Manage' }, de: HERO.messages.de };
    // ACT
    const instance = instanceOf(BASE, { slides: { hero: { messages: { en: { goal: 'Manage' } } } } });
    // ASSERT
    expect(instance.title?.messages).toEqual(expected);
  });

  it('gives a record that is no instance no trail', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const trail = instanceTrailOf(BASE);
    // ASSERT
    expect(trail).toBe(expected);
  });
});
