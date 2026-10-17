import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { assembleSpec, type SpecInputs } from './episode-spec-assemble.pure';
import { checkSpec } from './episode-spec.pure';
import { appendMetaVerified } from './staging-file.pure';

/*
 * assembleSpec at its one seam: inputs by stage in, the page's HTML out. Each test reads the page the way Han and
 * the Spec contract do, by role attributes, never by the helpers inside the module.
 */

const FRAME = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Spec · Template</title>
    <style>body{}</style>
  </head>
</html>
`;

const REVIEW_ASSET = `<!-- spec-review:start -->
<form id="spec-review" method="post">
  <button type="submit">Save review</button>
</form>
<!-- spec-review:end -->
`;

const BRIEF = `---
type: brief
title: Budget
---

# Budget

## Style

Editorial: sober Slides.

## Slides

### Why it forgets

1. (A) **Spent attention** — the window fills. _Visual:_ a bar filling up. _Research:_ 1
2. (B) **The quiet middle** — the middle goes quiet. _Visual:_ three columns.

### Spend it well

3. (A) **Trim the paste** — cut what you paste. _Visual:_ a log cut down.
`;

const DOSSIER = `---
type: dossier
title: Budget
---

# Budget {#budget}

## Why it forgets {#why-it-forgets}

#### Voice script

1. **Not a bug** — Forgetting is what a budget does.

### Spent attention {#spent-attention}

#### Visual

master: basic-page · motion: none

A bar that fills with blocks.

#### Speaker notes

1. **Attention sums to one** — softmax spreads it [1].
   - sources: [1] Attention Is All You Need — https://arxiv.org/abs/1706.03762

#### Voice script

1. **Whole window** — A model reads all of it every turn.

### The quiet middle {#the-quiet-middle}

#### Visual

Three columns.

#### Speaker notes

1. **Lost in the middle** — recall drops [1].
   - sources: [1] Lost in the Middle — https://arxiv.org/abs/2307.03172

#### Voice script

1. **Middle** — The middle loses.

## Spend it well {#spend-it-well}

#### Voice script

1. **Habits** — Three cheap habits.

### Trim the paste {#trim-the-paste}

#### Visual

A log cut down.

#### Speaker notes

1. **Why** — it works [1].
   - sources: [1] Lost in the Middle — https://arxiv.org/abs/2307.03172

#### Voice script

1. **Impulse buy** — Paste ten lines.
`;

const option = (id: string, recommended = false) => `
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

const FRAGMENTS = [
  `<!-- slide: top -->${setOption('0a', true)}${setOption('0b')}${setOption('0c')}`,
  `<!-- slide: spent-attention -->${option('1a', true)}${option('1b')}
<!-- slide: the-quiet-middle -->${option('2a')}${option('2b', true)}`,
  `<!-- slide: trim-the-paste -->${option('3a', true)}${option('3b')}`,
];

const BASE = {
  frame: FRAME,
  reviewAsset: REVIEW_ASSET,
  generated: { by: 'process:spec-assemble', at: '2026-10-12T12:00:00Z' },
};
const BRIEF_ONLY: SpecInputs = { ...BASE, brief: BRIEF };
const WITH_DOSSIER: SpecInputs = { ...BRIEF_ONLY, dossier: DOSSIER };
const FULL: SpecInputs = {
  ...WITH_DOSSIER,
  fragments: FRAGMENTS,
  visualLanguage: '<ul><li>One bar.</li></ul>',
  episodePage: '<ul><li>Route.</li></ul>',
};

const feedback = (round: number, ...items: string[]) =>
  `---\ntype: feedback\ntitle: Feedback round ${round}\ngenerated:\n  by: human:han\n  at: 2026-10-12T13:00:00Z\nround: ${round}\nvia: spec\n---\n\n# Feedback round ${round}\n\n${items.join('\n')}\n`;

const page = (inputs: SpecInputs) => load(assembleSpec(inputs));

const ids = ($: ReturnType<typeof page>, selector: string, attribute: string) =>
  $(selector)
    .map((_, element) => $(element).attr(attribute))
    .get();

describe('success cases', () => {
  it('shows a Slide card with purpose and visual idea from the Brief alone, with no Options', () => {
    // ARRANGE
    const sections = ['why-it-forgets', 'spend-it-well'];
    // ACT
    const $ = page(BRIEF_ONLY);
    const slide = $('article[data-spec="slide"]#spent-attention');
    // ASSERT
    expect(ids($, 'section[data-spec="section"]', 'id')).toEqual(sections);
    expect(slide.attr('data-number')).toBe('1');
    expect(slide.text()).toContain('the window fills');
    expect(slide.find('[data-spec="visual-idea"]').text()).toBe('a bar filling up');
    expect($('figure[data-spec="option"]')).toHaveLength(0);
    expect($('ol[data-spec="voice-script"]')).toHaveLength(0);
    expect($('#style').text()).toContain('Editorial: sober Slides.');
  });

  it('adds the Voice script and Speaker notes once the Dossier exists, citations in full', () => {
    // ARRANGE
    const url = 'https://arxiv.org/abs/1706.03762';
    // ACT
    const $ = page(WITH_DOSSIER);
    const slide = $('#spent-attention');
    // ASSERT
    expect(slide.find('ol[data-spec="voice-script"] li strong').text()).toBe('Whole window');
    expect(slide.find('[data-spec="speaker-notes"] [data-source="1"] a').attr('href')).toBe(url);
    expect($('#why-it-forgets .spec-section-band [data-spec="voice-script"] strong').text()).toBe('Not a bug');
    expect(slide.find('[data-spec="visual-idea"]').text()).toBe('A bar that fills with blocks.');
  });

  it('adds Options with pick boxes, wrapped build notes and a note field once fragments exist', () => {
    // ARRANGE
    const optionIds = ['1a', '1b'];
    // ACT
    const $ = page(FULL);
    const slide = $('#spent-attention');
    // ASSERT
    expect(ids($, '#spent-attention figure[data-option]', 'data-option')).toEqual(optionIds);
    expect(slide.find('input[type="checkbox"][form="spec-review"][name="pick:spent-attention"]')).toHaveLength(
      optionIds.length,
    );
    expect(slide.find('details.spec-build > [data-spec="build-notes"]')).toHaveLength(optionIds.length);
    expect(slide.find('textarea[form="spec-review"][name="note:spent-attention"]')).toHaveLength(1);
    expect($('#visual-language textarea[name="note:visual-language"]')).toHaveLength(1);
    expect($('#episode-page').text()).toContain('Route.');
  });

  it('assembles the Title-slide article before the first Section, its Options keeping their echoes', () => {
    // ARRANGE
    const options = 3;
    const echoes = options * 2;
    // ACT
    const html = assembleSpec(FULL);
    const $ = load(html);
    const title = $('article[data-spec="title-slide"]#top');
    // ASSERT
    expect(title.find('figure[data-option]')).toHaveLength(options);
    expect(title.find('[data-spec="echo"]')).toHaveLength(echoes);
    expect(title.find('textarea[name="note:top"]')).toHaveLength(1);
    expect(title.find('input[name="pick:top"]')).toHaveLength(options);
    expect(html.indexOf('id="top"')).toBeLessThan(html.indexOf('data-spec="section"'));
    expect($('.spec-outline a[href="#top"]')).toHaveLength(1);
  });

  it('locks a Slide with exactly one pick: data-picked on the Option, checked on its box alone', () => {
    // ARRANGE
    const round = feedback(
      1,
      '- `top` · design — picked: 0b',
      '- `why-it-forgets--spent-attention` · design — picked: 1b — tighter',
    );
    // ACT
    const $ = page({ ...FULL, feedback: [round] });
    // ASSERT
    expect($('#spent-attention figure[data-picked]').attr('data-option')).toBe('1b');
    expect($('#spent-attention input[type="checkbox"][checked]').attr('value')).toBe('1b');
    expect($('#top figure[data-picked]').attr('data-option')).toBe('0b');
    expect($('#the-quiet-middle figure[data-picked]')).toHaveLength(0);
  });

  it('lets a later round override an earlier one and keeps earlier locks the later round omits', () => {
    // ARRANGE
    const first = feedback(
      1,
      '- `why-it-forgets--spent-attention` · design — picked: 1a',
      '- `why-it-forgets--the-quiet-middle` · design — picked: none — try again',
    );
    const second = feedback(2, '- `why-it-forgets--the-quiet-middle` · design — picked: 2a');
    // ACT
    const $ = page({ ...FULL, feedback: [first, second] });
    // ASSERT
    expect($('#spent-attention figure[data-picked]').attr('data-option')).toBe('1a');
    expect($('#the-quiet-middle figure[data-picked]').attr('data-option')).toBe('2a');
  });

  it('assembles over an existing draft Spec to the same page', () => {
    // ARRANGE
    const draft = assembleSpec(FULL);
    // ACT
    const html = assembleSpec({ ...FULL, existing: draft });
    // ASSERT
    expect(html).toBe(draft);
  });

  it('produces a page that passes the Spec contract, with and without locks', () => {
    // ARRANGE
    const round = feedback(
      1,
      '- `top` · design — picked: 0c',
      '- `why-it-forgets--spent-attention` · design — picked: 1b',
    );
    const pages = [assembleSpec(FULL), assembleSpec({ ...FULL, feedback: [round] })];
    // ACT
    const findings = pages.flatMap((html) =>
      checkSpec({ 'spec/spec.html': html, 'dossier.md': DOSSIER }, REVIEW_ASSET).map(({ message }) => message),
    );
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('escapes the title and builds the meta block from the generated stamp', () => {
    // ARRANGE
    const brief = BRIEF.replaceAll('# Budget', '# Budget <&>');
    // ACT
    const html = assembleSpec({ ...FULL, brief });
    const meta: unknown = JSON.parse(load(html)('#spec-meta').text());
    // ASSERT
    expect(html).toContain('<title>Spec · Budget &lt;&amp;&gt;</title>');
    expect(meta).toMatchObject({ type: 'spec', status: 'draft', generated: BASE.generated, brief: '../brief.md' });
  });
});

describe('failure cases', () => {
  it('refuses once the existing Spec is approved', () => {
    // ARRANGE
    const approved = appendMetaVerified(assembleSpec(FULL), { by: 'human:han', at: '2026-10-12T14:00:00Z' });
    // ACT
    const run = () => assembleSpec({ ...FULL, existing: approved });
    // ASSERT
    expect(run).toThrow(/approved/);
  });
});

describe('edge cases', () => {
  it('leaves a Slide with zero or several picks unlocked', () => {
    // ARRANGE
    const round = feedback(
      1,
      '- `why-it-forgets--spent-attention` · design — picked: 1a, 1b',
      '- `why-it-forgets--the-quiet-middle` · design — picked: none — try columns',
    );
    // ACT
    const $ = page({ ...FULL, feedback: [round] });
    // ASSERT
    expect($('figure[data-picked]')).toHaveLength(0);
    expect($('input[type="checkbox"][checked]')).toHaveLength(0);
  });

  it('ignores a pick for an Option the Slide no longer has', () => {
    // ARRANGE
    const round = feedback(1, '- `why-it-forgets--spent-attention` · design — picked: 1c');
    // ACT
    const $ = page({ ...FULL, feedback: [round] });
    // ASSERT
    expect($('figure[data-picked]')).toHaveLength(0);
  });
});
