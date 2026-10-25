import { assembleSpec, type SpecInputs } from './episode-spec-assemble.pure';
import type { KnownVisuals } from './episode-staging.pure';

/*
 * A fixture Staging folder for the Slide plan's tests: a three-Slide Brief whose Slide 2 the plan reuses, adapts or
 * builds new, its Dossier, the designers' fragments, and the Spec assembled from them.
 */

export const KNOWN: KnownVisuals = { masters: ['basic-page'], motions: [] };

const FRAME = '<!doctype html>\n<html lang="en">\n<head>\n<title>Spec · Template</title>\n</head>\n</html>\n';
export const REVIEW_ASSET =
  '<!-- spec-review:start --><form id="spec-review" method="post"></form><!-- spec-review:end -->';

export const BRIEF = `---
type: brief
title: Budget
---

# Budget

## Slides

### Why it forgets

1. **Spent attention** — the window fills. _Visual:_ a bar filling up.
2. **The quiet middle** — the middle goes quiet. _Visual:_ three columns.

### Spend it well

3. **Trim the paste** — cut what you paste. _Visual:_ a log cut down.
`;

export const SLIDE_WORDS = `#### Visual

master: basic-page · motion: none

#### Speaker notes

1. **Attention sums to one** — softmax spreads it [1].
   - sources: [1] Attention Is All You Need — https://arxiv.org/abs/1706.03762

#### Voice script

1. **Whole window** — A model reads all of it every turn.
`;

/** The Dossier with Slide 2 as `slide2` gives it: its heading line and whatever follows. */
export const dossier = (slide2: string) => `---
type: dossier
title: Budget
---

# Budget {#budget}

## Why it forgets {#why-it-forgets}

#### Voice script

1. **Not a bug** — Forgetting is what a budget does.

### Spent attention {#spent-attention}

${SLIDE_WORDS}
${slide2}
## Spend it well {#spend-it-well}

#### Voice script

1. **Habits** — Three cheap habits.

### Trim the paste {#trim-the-paste}

${SLIDE_WORDS}`;

export const REUSED_IN_DOSSIER = dossier('### The quiet middle {#the-quiet-middle}\n');
export const ADAPTED_IN_DOSSIER = dossier(`### The quiet middle {#the-quiet-middle}\n\n${SLIDE_WORDS}`);

export const REUSE_PLAN = `# Slide plan

## Slides

- Slide 1: new.
- Slide 2: reuse lost-in-the-middle; held by ai-attention-span; cites AIE-0011.
- Slide 3: new.
`;

export const option = (id: string, recommended = false) => `
<figure data-spec="option" data-option="${id}"${recommended ? ' data-recommended' : ''}>
  <div data-spec="mock" class="bg-card p-4"><p class="text-body">Mock ${id}</p></div>
  <figcaption><b>${id}</b> A reason. Build cost: Scene.</figcaption>
  <div data-spec="build-notes">Parts for ${id}.</div>
</figure>`;
const echo = (section: string) =>
  `<li data-spec="echo" data-section="${section}"><p>${section}</p><div data-spec="mock" class="p-2">Echo</div></li>`;
const setOption = (id: string, recommended = false) => `
<figure data-spec="option" data-option="${id}"${recommended ? ' data-recommended' : ''}>
  <div data-spec="mock" class="bg-card p-4"><p class="text-hero">Title ${id}</p></div>
  <ol data-spec="echoes" class="spec-echoes">${echo('why-it-forgets')}${echo('spend-it-well')}</ol>
  <figcaption><b>${id}</b> A motif. Build cost: Scene.</figcaption>
  <div data-spec="build-notes">The set ${id}.</div>
</figure>`;
export const ORIGIN =
  '<figure data-spec="origin" data-pool="lost-in-the-middle"><div data-spec="mock" class="p-4">The pool Slide</div><figcaption>The pool Slide as it is.</figcaption></figure>';

/** The designers' fragments: the Title slide, Slides 1 and 3, and Slide 2 only when it is no reuse. */
const fragments = (slide2 = '') => [
  `<!-- slide: top -->${setOption('0a', true)}${setOption('0b')}${setOption('0c')}`,
  `<!-- slide: spent-attention -->${option('1a', true)}${option('1b')}${slide2}`,
  `<!-- slide: trim-the-paste -->${option('3a', true)}${option('3b')}`,
];

export const inputs = (plan: string, dossierText: string, slide2 = ''): SpecInputs => ({
  frame: FRAME,
  reviewAsset: REVIEW_ASSET,
  generated: { by: 'process:spec-assemble', at: '2026-10-12T12:00:00Z' },
  brief: BRIEF,
  dossier: dossierText,
  slidePlan: plan,
  fragments: fragments(slide2),
  visualLanguage: '<ul><li>One bar.</li></ul>',
});

/** A staging folder whose Spec is assembled from its own Brief, Dossier and Slide plan. */
export function staging(plan: string, dossierText: string, slide2 = ''): Record<string, string> {
  return {
    'brief.md': BRIEF,
    'dossier.md': dossierText,
    'slide-plan.md': plan,
    'spec/spec.html': assembleSpec(inputs(plan, dossierText, slide2)),
  };
}
