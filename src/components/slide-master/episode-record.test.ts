import { describe, expect, it } from 'vitest';
import { episode, slidesFor, type RuntimeKit, type Section, type SlideKit, type TitledSlide } from './episode-record';

/*
 * The record's typing is its contract: each `@ts-expect-error` below is a
 * proof `npm run typecheck` holds — if the line stopped failing, tsc reports
 * the unused directive. The Slides are page-template's, whose Translation
 * subtree is flat (`episodes.page-template.slides.<slide>.*`).
 */
const slide = slidesFor('page-template');

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

const whyATemplate = slide({
  slug: 'why-a-template',
  notes: [{ slug: 'reference-episode', target: 'prose' }],
  segments: [{ slug: 'one-breath' }],
  content: ({ t, ref, target, slideHref, template }) => {
    t('title');
    ref('reference-episode');
    target('prose');
    slideHref('what-comes-next');
    template('spine.next');
    return null;
  },
});

const foundations = slide({ slug: 'foundations', content: ({ t }) => t('title') });
const nextSteps = slide({ slug: 'next-steps', content: ({ t }) => t('caption') });

describe('success cases', () => {
  it('keeps what a Slide declares and renders its Canvas from the kit it is given', () => {
    // ARRANGE
    const { kit, calls } = recordingKit();
    const expected = [
      't:title',
      'ref:reference-episode',
      'target:prose',
      'slideHref:what-comes-next',
      'template:spine.next',
    ];
    // ACT
    whyATemplate.content(kit);
    // ASSERT
    expect(whyATemplate).toMatchObject({
      episode: 'page-template',
      slug: 'why-a-template',
      notes: [{ slug: 'reference-episode', target: 'prose' }],
      segments: [{ slug: 'one-breath' }],
    });
    expect(calls).toEqual(expected);
  });

  it('defaults notes and segments to none', () => {
    // ARRANGE
    const expected = { episode: 'page-template', slug: 'foundations', notes: [], segments: [] };
    // ACT
    const { content, ...data } = foundations;
    // ASSERT
    expect(data).toEqual(expected);
    expect(typeof content).toBe('function');
  });

  it('composes an Episode from Sections whose first Slide is titled', () => {
    // ARRANGE
    const sections = [[foundations, whyATemplate], [nextSteps]] as const;
    // ACT
    const record = episode({ slug: 'page-template', sections });
    // ASSERT
    expect(record.sections).toBe(sections);
  });
});

describe('failure cases', () => {
  it('rejects at compile time what the Translation file does not back', () => {
    // ARRANGE
    const bad = () => [
      slide({
        slug: 'why-a-template',
        notes: [{ slug: 'reference-episode', target: 'prose' }],
        content: ({ t, ref, target, slideHref, template }) => {
          // @ts-expect-error -- a key outside this Slide's Translation subtree
          t('columns.master.title');
          // @ts-expect-error -- a Slide slug this Episode's Translation file does not hold
          slideHref('no-such-slide');
          // @ts-expect-error -- a key of another Slide's subtree
          template('statement');
          // @ts-expect-error -- a subtree, not a string leaf
          template('spine');
          // @ts-expect-error -- a note this Slide does not declare
          ref('no-such-note');
          // @ts-expect-error -- a target no note of this Slide names
          target('caption');
          return null;
        },
      }),
      // @ts-expect-error -- no `episodes.page-template.slides.no-such-slide` subtree
      slide({ slug: 'no-such-slide', content: () => null }),
      // @ts-expect-error -- `what-comes-next` translates no notes
      slide({ slug: 'what-comes-next', notes: [{ slug: 'reference-episode', target: 'title' }], content: () => null }),
      // @ts-expect-error -- a segment the Slide's Voice script does not translate
      slide({ slug: 'why-a-template', segments: [{ slug: 'two-breaths', from: 0, to: 1 }], content: () => null }),
    ];
    // ACT
    const built = typeof bad;
    // ASSERT
    expect(built).toBe('function');
  });

  it('accepts the runtime kit wherever a typed Slide kit is expected, so the erasure is sound', () => {
    // ARRANGE
    type WhyKit = SlideKit<'page-template', 'why-a-template', { slug: 'reference-episode'; target: 'prose' }>;
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
    const titled: TitledSlide<'page-template'> = foundations;
    // ACT
    const sections: Section<'page-template'>[] = [[titled, whyATemplate]];
    // ASSERT
    expect(sections[0][0].slug).toBe('foundations');
  });
});
