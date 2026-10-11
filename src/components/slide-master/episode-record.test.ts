import { describe, expect, it } from 'vitest';
import { episode, slidesFor, type Section, type SlideKit, type TitledSlide } from './episode-record';
import type { RuntimeKit } from './slide-base';

/*
 * The record's typing is its contract: each `@ts-expect-error` below is a
 * proof `npm run typecheck` holds — if the line stopped failing, tsc reports
 * the unused directive. The Slides are slide-layouts', whose Translation
 * subtree is flat (`episodes.slide-layouts.slides.<slide>.*`). The old shape
 * lives until every Episode is self-contained (#51); `slide.test.ts` holds the new.
 */
const slide = slidesFor('slide-layouts');

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
    target: (name) => (calls.push(`target:${name}`), { 'data-target': name }),
    Title: () => null as never,
  };
  return { kit, calls };
}

const basicPage = slide({
  slug: 'basic-page',
  notes: [{ slug: 'layout-target', target: 'prose' }],
  content: ({ t, ref, target, slideHref, template }) => {
    t('title');
    ref('layout-target');
    target('prose');
    slideHref('three-column');
    template('prose');
    return null;
  },
});

const sectionSlide = slide({ slug: 'section-slide', content: ({ t }) => t('title') });
const threeColumn = slide({ slug: 'three-column', content: ({ t }) => t('caption') });

describe('success cases', () => {
  it('keeps what a Slide declares and renders its Scene from the kit it is given', () => {
    // ARRANGE
    const { kit, calls } = recordingKit();
    const expected = ['t:title', 'ref:layout-target', 'target:prose', 'slideHref:three-column', 'template:prose'];
    // ACT
    basicPage.content(kit);
    // ASSERT
    expect(basicPage).toMatchObject({
      episode: 'slide-layouts',
      slug: 'basic-page',
      notes: [{ slug: 'layout-target', target: 'prose' }],
      segments: [],
    });
    expect(calls).toEqual(expected);
  });

  it('defaults notes and segments to none', () => {
    // ARRANGE
    const expected = { episode: 'slide-layouts', slug: 'section-slide', notes: [], segments: [] };
    // ACT
    const { content, ...data } = sectionSlide;
    // ASSERT
    expect(data).toEqual(expected);
    expect(typeof content).toBe('function');
  });

  it('composes an Episode from Sections whose first Slide is titled', () => {
    // ARRANGE
    const sections = [[sectionSlide, basicPage], [threeColumn]] as const;
    // ACT
    const record = episode({ slug: 'slide-layouts', sections });
    // ASSERT
    expect(record.sections).toBe(sections);
  });
});

describe('failure cases', () => {
  it('rejects at compile time what the Translation file does not back', () => {
    // ARRANGE
    const bad = () => [
      slide({
        slug: 'basic-page',
        notes: [{ slug: 'layout-target', target: 'prose' }],
        content: ({ t, ref, target, slideHref, template }) => {
          // @ts-expect-error -- a key outside this Slide's Translation subtree
          t('columns.first.title');
          // @ts-expect-error -- a Slide slug this Episode's Translation file does not hold
          slideHref('no-such-slide');
          // @ts-expect-error -- a key of another Slide's subtree
          template('columns.first.prose');
          // @ts-expect-error -- a subtree, not a string leaf
          template('notes');
          // @ts-expect-error -- a note this Slide does not declare
          ref('no-such-note');
          // @ts-expect-error -- a target no note of this Slide names
          target('caption');
          return null;
        },
      }),
      // @ts-expect-error -- no `episodes.slide-layouts.slides.no-such-slide` subtree
      slide({ slug: 'no-such-slide', content: () => null }),
      // @ts-expect-error -- `section-slide` translates no notes
      slide({ slug: 'section-slide', notes: [{ slug: 'layout-target', target: 'title' }], content: () => null }),
      // @ts-expect-error -- a segment the Slide's Voice script does not translate
      slide({ slug: 'basic-page', segments: [{ slug: 'two-breaths' }], content: () => null }),
    ];
    // ACT
    const built = typeof bad;
    // ASSERT
    expect(built).toBe('function');
  });

  it('accepts the runtime kit wherever a typed Slide kit is expected, so the erasure is sound', () => {
    // ARRANGE
    type WhyKit = SlideKit<'slide-layouts', 'basic-page', { slug: 'layout-target'; target: 'prose' }>;
    const { kit } = recordingKit();
    // ACT
    const typed: WhyKit = kit;
    // ASSERT
    expect(typed).toBe(kit);
  });
});

describe('edge cases', () => {
  it('lets only a titled Slide open a Section', () => {
    // ARRANGE
    const titled: TitledSlide<'slide-layouts'> = sectionSlide;
    const expected = 'section-slide';
    // ACT
    const sections: Section<'slide-layouts'>[] = [[titled, basicPage]];
    // ASSERT
    expect(sections[0][0].slug).toBe(expected);
  });
});
