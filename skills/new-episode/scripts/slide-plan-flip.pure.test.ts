import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { assembleSpec } from '../../../src/lib/episode-spec-assemble.pure.ts';
import { specSlides, specTitleSlideOptions } from '../../../src/lib/episode-spec-page.pure.ts';
import { checkStagingFolder } from '../../../src/lib/episode-staging.pure.ts';
import {
  ADAPTED_IN_DOSSIER,
  inputs,
  KNOWN,
  option,
  ORIGIN,
  REUSE_PLAN,
  REUSED_IN_DOSSIER,
  REVIEW_ASSET,
  staging,
} from '../../../src/lib/slide-plan.fixture.ts';
import { flipSlidePlan } from '../../../src/lib/slide-plan.pure.ts';
import { reviewToFeedback, type Review } from './spec-feedback.pure.ts';

/*
 * A flip at the Spec Gate (design-ADR 0016, Pipeline and evidence rule 14): Han's review of the served Spec in, the
 * feedback round and the flipped Slide plan out, and the next Spec assembled from that plan.
 */

const NOTE = 'The example becomes a sales call.';
const PICKS: [string, string][] = [
  ['pick:top', '0a'],
  ['pick:spent-attention', '1a'],
  ['pick:trim-the-paste', '3a'],
];

function review(html: string, fields: [string, string][]): Review {
  return {
    fields: [...PICKS, ...fields],
    slides: specSlides(html),
    titleSlide: specTitleSlideOptions(html),
    round: 1,
    now: new Date('2026-10-12T14:00:00Z'),
  };
}

const ADAPTED_FRAGMENT = `<!-- slide: the-quiet-middle -->${ORIGIN}${option('2a', true)}${option('2b')}`;

describe('success cases', () => {
  it('Flipping a Slide from reuse to adapt at the Spec Gate changes the Slide plan and the Spec', () => {
    // ARRANGE
    const before = staging(REUSE_PLAN, REUSED_IN_DOSSIER);
    const html = before['spec/spec.html'] ?? '';
    // ACT
    const result = reviewToFeedback(
      review(html, [
        ['plan:the-quiet-middle', 'adapt'],
        ['note:the-quiet-middle', NOTE],
      ]),
    );
    const flips = result.kind === 'saved' ? result.flips : [];
    const plan = flipSlidePlan(REUSE_PLAN, flips);
    const stale = checkStagingFolder({ ...before, 'slide-plan.md': plan }, KNOWN, REVIEW_ASSET);
    const next = assembleSpec(inputs(plan, ADAPTED_IN_DOSSIER, ADAPTED_FRAGMENT));
    const round = result.kind === 'saved' ? { [result.file]: result.text } : {};
    const after = checkStagingFolder(
      { ...before, ...round, 'slide-plan.md': plan, 'dossier.md': ADAPTED_IN_DOSSIER, 'spec/spec.html': next },
      KNOWN,
      REVIEW_ASSET,
    );
    const adapted = load(next)('article[data-spec="slide"]#the-quiet-middle');
    // ASSERT
    expect(result.kind === 'saved' ? result.text : '').toContain(
      `- \`why-it-forgets--the-quiet-middle\` · design — plan: adapt — ${NOTE}`,
    );
    expect(plan).toContain(
      `- Slide 2: adapt lost-in-the-middle; held by ai-attention-span; cites AIE-0011; changes ${NOTE}`,
    );
    expect(stale.map(({ message }) => message)).toContain(
      'The Spec Slide 2 {#the-quiet-middle} shows data-reused="lost-in-the-middle", but the Slide plan says adapt lost-in-the-middle: assemble the Spec again.',
    );
    expect(after.map(({ message }) => message)).toEqual([]);
    expect(adapted.attr('data-adapted')).toBe('lost-in-the-middle');
    expect(adapted.find('figure[data-spec="origin"]')).toHaveLength(1);
    expect(adapted.find('figure[data-spec="option"]')).toHaveLength(2);
    expect(adapted.find('[data-spec="adapted"]').text()).toBe(
      `Adapted from lost-in-the-middle, held by ai-attention-span: ${NOTE}`,
    );
  });

  it('asks nothing of a reused Slide Han leaves as it is', () => {
    // ARRANGE
    const html = staging(REUSE_PLAN, REUSED_IN_DOSSIER)['spec/spec.html'] ?? '';
    // ACT
    const result = reviewToFeedback(review(html, [['plan:the-quiet-middle', 'reuse']]));
    // ASSERT
    expect(result.kind).toBe('saved');
    expect(result.kind === 'saved' ? result.text : '').not.toContain('the-quiet-middle');
  });
});

describe('failure cases', () => {
  it('refuses a flip to adapt that says not what changes', () => {
    // ARRANGE
    const html = staging(REUSE_PLAN, REUSED_IN_DOSSIER)['spec/spec.html'] ?? '';
    // ACT
    const result = reviewToFeedback(review(html, [['plan:the-quiet-middle', 'adapt']]));
    // ASSERT
    expect(result).toEqual({
      kind: 'rejected',
      faults: [
        {
          slide: 'the-quiet-middle',
          message: 'Slide 2 "the-quiet-middle" is flipped to adapt: say in its note what changes.',
        },
      ],
    });
  });

  it('refuses a note on a reused Slide that is not flipped', () => {
    // ARRANGE
    const html = staging(REUSE_PLAN, REUSED_IN_DOSSIER)['spec/spec.html'] ?? '';
    // ACT
    const result = reviewToFeedback(review(html, [['note:the-quiet-middle', NOTE]]));
    // ASSERT
    expect(result).toEqual({
      kind: 'rejected',
      faults: [
        {
          slide: 'the-quiet-middle',
          message: 'Slide 2 "the-quiet-middle" is reused and keeps its words: flip it to adapt to change it.',
        },
      ],
    });
  });
});
