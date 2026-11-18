import { describe, expect, it } from 'vitest';
import { instanceOf } from './episode-instance';
import type { InstanceRecord, InstanceSlide } from './episode-instance.pure';
import { staleOutline, type ResolvedOutline } from './episode-outline-check';
import type { SectionList } from './episode.pure';

interface Titled {
  readonly en: { readonly title: string };
  readonly de: { readonly title: string };
}

declare module './episode-instance' {
  interface BaseSlideMessages {
    'outline-check-demo': { readonly why: Titled; readonly watch: Titled };
  }
}

const text = (title: string) => ({ en: { title }, de: { title: `${title}-de` } });
const slideOf = (slug: string, title: string): InstanceSlide => ({ slug, messages: text(title) });

interface Demo extends InstanceRecord {
  readonly slug: 'outline-check-demo';
  readonly messages: typeof EPISODE_TEXT;
  readonly sections: readonly SectionList<InstanceSlide>[];
}

const demo = (fields: Omit<Demo, 'slug' | 'messages'>): Demo => ({
  slug: 'outline-check-demo',
  messages: EPISODE_TEXT,
  ...fields,
});
const EPISODE_TEXT = {
  en: { title: 'Cash', caption: 'c', description: 'd' },
  de: { title: 'Geld', caption: 'c', description: 'd' },
};
const WHY = slideOf('why', 'Why');
const WATCH = slideOf('watch', 'Watch');
const BASE = demo({ sections: [[WHY, WATCH]] });

const RESOLVED: ResolvedOutline = {
  text: EPISODE_TEXT,
  sections: [
    [
      { slug: 'why', anchor: 'why', text: text('Why') },
      { slug: 'watch', anchor: 'why--watch', text: text('Watch') },
    ],
  ],
};

describe('success cases', () => {
  it('finds nothing when the outline lists the Slides and anchors of the record and its files hold its text', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const found = staleOutline(BASE, RESOLVED);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it("finds nothing on an Episode instance whose outline names its base and layers its override's file", () => {
    // ARRANGE
    const instance = instanceOf(BASE, { slides: { watch: { messages: { de: { title: 'Schau' } } } } });
    const resolved: ResolvedOutline = {
      ...RESOLVED,
      base: BASE.slug,
      sections: [
        [
          RESOLVED.sections[0][0],
          { slug: 'watch', anchor: 'why--watch', text: { ...text('Watch'), de: { title: 'Schau' } } },
        ],
      ],
    };
    const expected: string[] = [];
    // ACT
    const found = staleOutline(instance, resolved);
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('asks for `npm run registry` when the outline holds no entry for the page', () => {
    // ARRANGE
    const expected = ['No outline is registered for the page: run `npm run registry`'];
    // ACT
    const found = staleOutline(BASE, undefined);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names an outline whose Slides, anchors or base differ from the record', () => {
    // ARRANGE
    const moved = instanceOf(BASE, { sections: [{ hide: 'watch' }] });
    const expected = ['its outline lists other Slides, anchors or another Base Episode: run `npm run registry`'];
    // ACT
    const found = staleOutline(moved, RESOLVED);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names each text the outline traces to files that hold other text, as an override not yet in it', () => {
    // ARRANGE
    const overridden = instanceOf(BASE, {
      title: { messages: { en: { title: 'Cash today' } } },
      slides: { why: { messages: { de: { title: 'Warum heute' } } } },
    });
    const expected = [
      'its outline traces the en Episode text to files holding other text: run `npm run registry`',
      'its outline traces the de text of why to files holding other text: run `npm run registry`',
    ];
    // ACT
    const found = staleOutline(overridden, { ...RESOLVED, base: BASE.slug });
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('compares the Title slide too, under the top anchor', () => {
    // ARRANGE
    const titled = demo({ title: WHY, sections: [[WATCH]] });
    const resolved: ResolvedOutline = {
      text: EPISODE_TEXT,
      title: { slug: 'why', anchor: 'top', text: { ...text('Why'), en: { title: 'Old' } } },
      sections: [[{ slug: 'watch', anchor: 'watch', text: text('Watch') }]],
    };
    const expected = ['its outline traces the en text of top to files holding other text: run `npm run registry`'];
    // ACT
    const found = staleOutline(titled, resolved);
    // ASSERT
    expect(found).toEqual(expected);
  });
});
