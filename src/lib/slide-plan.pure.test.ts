import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { checkStagingFolder } from './episode-staging.pure';
import { checkSlidePlan, type SlidePlanContext } from './slide-plan-check.pure';
import {
  ADAPTED_IN_DOSSIER,
  BRIEF,
  dossier,
  KNOWN,
  option,
  ORIGIN,
  REUSE_PLAN,
  REUSED_IN_DOSSIER,
  REVIEW_ASSET,
  SLIDE_WORDS,
  staging,
} from './slide-plan.fixture';

/*
 * The Slide plan (design-ADR 0016, Pipeline and evidence rules 12 to 15) at the pipeline's seams: what the staging
 * check refuses in a fixture Staging folder, what the assembled Spec shows, and what the plan check refuses against
 * the Slides the repository holds.
 */

const ADAPT_PLAN = REUSE_PLAN.replace(
  'reuse lost-in-the-middle; held by ai-attention-span; cites AIE-0011',
  'adapt lost-in-the-middle; held by ai-attention-span; cites AIE-0011; changes the example becomes a sales call',
);
const MIGRATE = `# Research plan

## Research jobs

- migrate: AIE-0016__why-recall-drops-mid-window, lost-in-the-middle, informs llm-behaviour.

## Reuse

- Slide 2: reuse AIE-0011, confidence contested, fresh until 2027-04-19.
`;
const ADAPTED_FRAGMENT = `<!-- slide: the-quiet-middle -->${ORIGIN}${option('2a', true)}${option('2b')}`;

/** The repository as the pool listing gives it: the candidate held by one Episode, its notes grandfathered. */
const context = (researchPlan: string | undefined): SlidePlanContext => ({
  episode: 'budget',
  slides: [{ slug: 'lost-in-the-middle', owner: undefined, heldBy: ['ai-attention-span'], cites: ['AIE-0011'] }],
  grandfathered: ['lost-in-the-middle'],
  researchPlan,
});

const messages = (findings: readonly { message: string }[]) => findings.map(({ message }) => message);

describe('success cases', () => {
  it('A Slide that is reused in a new Episode costs one reference, no Options and no Voice script', () => {
    // ARRANGE
    const files = staging(REUSE_PLAN, REUSED_IN_DOSSIER);
    // ACT
    const findings = checkStagingFolder(files, KNOWN, REVIEW_ASSET);
    const $ = load(files['spec/spec.html'] ?? '');
    const reused = $('article[data-spec="slide"][data-number="2"]');
    // ASSERT
    expect(messages(findings)).toEqual([]);
    expect($('article[data-spec="slide"][data-reused="lost-in-the-middle"]')).toHaveLength(1);
    expect(reused.attr('id')).toBe('the-quiet-middle');
    expect(reused.find('[data-spec="reused"]').text()).toBe(
      'Reused from lost-in-the-middle, held by ai-attention-span.',
    );
    expect(reused.find('figure[data-spec="option"]')).toHaveLength(0);
    expect(reused.find('[data-spec="voice-script"]')).toHaveLength(0);
  });
  it('Adapting a Slide leaves the other Episodes unchanged, and an adapted note with a grandfathered source gets a Research question', () => {
    // ARRANGE
    const files = { ...staging(ADAPT_PLAN, ADAPTED_IN_DOSSIER, ADAPTED_FRAGMENT), 'research-plan.md': MIGRATE };
    // ACT
    const planned = checkSlidePlan('slide-plan.md', ADAPT_PLAN, context(MIGRATE));
    const agreed = checkStagingFolder(files, KNOWN, REVIEW_ASSET);
    // ASSERT
    expect(messages(planned)).toEqual([]);
    expect(messages(agreed)).toEqual([]);
  });
});

describe('failure cases', () => {
  it('refuses an adapted Slide with a grandfathered source and no migrate research job', () => {
    // ARRANGE
    const researchPlan = MIGRATE.replace(/^- migrate:.*$/m, '');
    // ACT
    const findings = checkSlidePlan('slide-plan.md', ADAPT_PLAN, context(researchPlan));
    // ASSERT
    expect(messages(findings)).toEqual([
      'Slide 2 adapts lost-in-the-middle, whose Speaker notes cite a Source of the Source baseline: the research plan needs `migrate: <folder>, lost-in-the-middle, informs <concept-id>, …`, so the baseline entries leave in this Run.',
    ]);
  });

  it("refuses an adapted Slide under its origin's slug, which would change it for every Episode", () => {
    // ARRANGE
    const adapted = ADAPTED_IN_DOSSIER.replace('{#the-quiet-middle}', '{#lost-in-the-middle}');
    // ACT
    const findings = checkStagingFolder(
      { 'brief.md': BRIEF, 'dossier.md': adapted, 'slide-plan.md': ADAPT_PLAN },
      KNOWN,
      REVIEW_ASSET,
    );
    // ASSERT
    expect(messages(findings)).toEqual([
      "The Dossier Slide {#lost-in-the-middle} adapts lost-in-the-middle under its origin's slug: an instance takes a slug of its own, so the other Episodes keep the pool Slide.",
    ]);
  });

  it('refuses a candidate the repository does not hold, or whose holders and citations the plan misstates', () => {
    // ARRANGE
    const plan = ADAPT_PLAN.replace(
      'held by ai-attention-span; cites AIE-0011',
      'held by ai-token-economy; cites none',
    ).replace('- Slide 1: new.', '- Slide 1: reuse no-such-slide; held by ai-token-economy; cites none.');
    // ACT
    const findings = checkSlidePlan('slide-plan.md', plan, context(MIGRATE));
    // ASSERT
    expect(messages(findings)).toEqual([
      'Slide 1 names no-such-slide, which is no page Slide of any Episode or the Slide pool.',
      "Slide 2's candidate lost-in-the-middle is held by ai-attention-span, not ai-token-economy: copy `held by` from `npm run slides:pool`.",
      "Slide 2's candidate lost-in-the-middle cites AIE-0011, not none: copy `cites` from `npm run slides:pool`.",
    ]);
  });

  it("refuses a candidate still in another Episode's folder whose move to the pool the plan does not list", () => {
    // ARRANGE
    const owned: SlidePlanContext = {
      ...context(MIGRATE),
      slides: [{ ...context(MIGRATE).slides[0], owner: 'ai-attention-span' }],
    };
    // ACT
    const findings = checkSlidePlan('slide-plan.md', ADAPT_PLAN, owned);
    const listed = checkSlidePlan(
      'slide-plan.md',
      ADAPT_PLAN.replace('cites AIE-0011;', 'cites AIE-0011; moves from ai-attention-span;'),
      owned,
    );
    // ASSERT
    expect(messages(findings)).toEqual([
      "Slide 2's candidate lost-in-the-middle lives in ai-attention-span's own slides/: add `moves from ai-attention-span`, so its owner sees the move to the Slide pool.",
    ]);
    expect(messages(listed)).toEqual([]);
  });

  it('refuses a reused Slide that the Dossier gives a Voice script', () => {
    // ARRANGE
    const files = staging(REUSE_PLAN, dossier(`### The quiet middle {#the-quiet-middle}\n\n${SLIDE_WORDS}`));
    // ACT
    const findings = checkStagingFolder(files, KNOWN, REVIEW_ASSET);
    // ASSERT
    expect(messages(findings)).toEqual([
      'The Dossier Slide {#the-quiet-middle} is reused from lost-in-the-middle by the Slide plan, so it holds no Visual, Speaker notes or Voice script: a reused Slide keeps its words.',
    ]);
  });

  it('refuses a reused Slide that the Spec gives Options', () => {
    // ARRANGE
    const files = staging(REUSE_PLAN, REUSED_IN_DOSSIER);
    const html = (files['spec/spec.html'] ?? '').replace(
      '<label class="spec-plan">',
      `<div class="spec-options">${option('2a', true)}</div><label class="spec-plan">`,
    );
    // ACT
    const findings = checkStagingFolder({ ...files, 'spec/spec.html': html }, KNOWN, REVIEW_ASSET);
    // ASSERT
    expect(messages(findings)).toEqual([
      'The Slide {#the-quiet-middle} is reused from lost-in-the-middle, so it has no Options: a reused Slide costs one reference and keeps how it looks.',
    ]);
  });

  it('refuses a new Slide whose Dossier entry has no Visual, Speaker notes or Voice script', () => {
    // ARRANGE
    const plan = REUSE_PLAN.replace('reuse lost-in-the-middle; held by ai-attention-span; cites AIE-0011', 'new');
    const files = { 'brief.md': BRIEF, 'dossier.md': REUSED_IN_DOSSIER, 'slide-plan.md': plan };
    // ACT
    const findings = checkStagingFolder(files, KNOWN, REVIEW_ASSET);
    // ASSERT
    expect(messages(findings)).toEqual([
      'The Dossier Slide {#the-quiet-middle} has no #### Visual, #### Speaker notes, #### Voice script: only a Slide the Slide plan reuses goes without its words.',
    ]);
  });

  it('refuses a Slide plan that misses a Slide of the Brief or names one the Brief lacks', () => {
    // ARRANGE
    const plan = REUSE_PLAN.replace('- Slide 3: new.', '- Slide 4: new.');
    // ACT
    const findings = checkStagingFolder({ 'brief.md': BRIEF, 'slide-plan.md': plan }, KNOWN, REVIEW_ASSET);
    // ASSERT
    expect(messages(findings)).toEqual([
      'The Slide plan has no item for Slide 3 of the Brief: decide reuse, adapt or new for it.',
      'The Slide plan has an item for Slide 4, which the Brief does not have.',
    ]);
  });
});

describe('edge cases', () => {
  it('holds a Staging folder with no Slide plan to every Dossier page Slide carrying its words', () => {
    // ARRANGE
    const files = { 'brief.md': BRIEF, 'dossier.md': REUSED_IN_DOSSIER };
    // ACT
    const findings = checkStagingFolder(files, KNOWN, REVIEW_ASSET);
    // ASSERT
    expect(messages(findings)).toEqual([
      'The Dossier Slide {#the-quiet-middle} has no #### Visual, #### Speaker notes, #### Voice script: only a Slide the Slide plan reuses goes without its words.',
    ]);
  });
});
