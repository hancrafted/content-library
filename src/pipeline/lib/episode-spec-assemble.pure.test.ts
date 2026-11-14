import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { assembleSpec, type SpecInputs } from './episode-spec-assemble.pure';
import { checkSpec } from './episode-spec.pure';
import { appendMetaVerified } from './staging-file.pure';

/*
 * assembleSpec at its one seam: inputs by stage in, the page's HTML out. Each test reads the page the way Han and
 * the Spec contract do, by role attributes, never by the helpers inside the module.
 */

/** A slotted Spec template: a page frame with the slots the assembler fills, the review form and two <template>s. */
const TEMPLATE = `<!doctype html>
<html lang="en" data-mode="decide">
  <head>
    <meta charset="utf-8" />
    <title data-slot="page-title">Spec · Template</title>
    <style>body{}</style>
    <script type="application/json" id="spec-meta" data-slot="meta"></script>
  </head>
  <body>
    <div class="spec-shell">
      <nav class="spec-outline" aria-label="Slides" data-slot="outline"></nav>
      <main class="spec-page">
        <header class="spec-masthead">
          <p class="spec-kicker" data-slot="kicker"></p>
          <h1 data-slot="heading"></h1>
          <p data-slot="lede"></p>
        </header>
        <div class="spec-intro" data-slot="intro"></div>
        <div data-slot="items"></div>
      </main>
    </div>
    <form id="spec-review" method="post"><button type="submit">Save review</button></form>
    <template data-template="item">
      <article data-spec="slide" data-fidelity data-depth="simple">
        <header class="spec-slide-head"><span class="spec-number" data-slot="number"></span><h3 data-slot="title"></h3></header>
        <p class="spec-purpose" data-slot="purpose"></p>
        <div data-slot="words"></div>
        <div class="spec-options" data-slot="options"></div>
        <textarea class="spec-note" form="spec-review" data-slot="note"></textarea>
      </article>
    </template>
    <template data-template="option">
      <figure data-spec="option" data-option data-recommended>
        <div data-slot="stage"></div>
        <figcaption data-slot="caption"></figcaption>
        <details class="spec-build"><summary>Build notes</summary><div data-slot="build-notes"></div></details>
        <label class="spec-pick"><input type="checkbox" form="spec-review" data-slot="pick" /> Pick <b data-slot="id"></b></label>
      </figure>
    </template>
  </body>
</html>
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

/** The fidelity the Spec calibration gives every item. */
const FIDELITY = 'mock';

const BASE = {
  template: TEMPLATE,
  generated: { by: 'process:spec-assemble', at: '2026-10-12T12:00:00Z' },
};
const CARD_BRIEF = BRIEF.replace(
  '## Style',
  `## Format

Short, five minutes.

## Audience

Office workers who paste whole documents.

## Hook

The AI forgot your first line.

## Red thread

Attention is a budget, so spend it.

## Analogy

A desk that only fits one stack.

- The desk is the window.
- The stack is the paste.

The desk never grows.

## Learning goal

Know the budget.

## Actionables

1. Trim pastes.
2. Reset early.

## Research questions

- How does recall drop?

## Constraints

Under ten minutes.

## Style`,
);

const APPROVED_BRIEF = CARD_BRIEF.replace(
  'title: Budget\n',
  'title: Budget\ngenerated:\n  by: process:brief-grill\n  at: 2026-10-12T10:00:00Z\nverified:\n  - by: human:han\n    at: 2026-10-12T11:00:00Z\n',
);

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

  it("puts a Slide's words in collapsibles closed by default, one per kind that exists, and no tabs", () => {
    // ARRANGE
    const kinds = ['visual-idea', 'voice-script', 'speaker-notes'];
    const labels = ['Visual idea', 'Voice script', 'Speaker notes'];
    // ACT
    const $ = page(WITH_DOSSIER);
    const panels = $('#spent-attention .spec-words > details');
    // ASSERT
    expect(ids($, '#spent-attention .spec-words > details', 'data-panel')).toEqual(kinds);
    expect(panels.map((_, panel) => $(panel).children('summary').text().trim()).get()).toEqual(labels);
    expect(panels.filter('[open]')).toHaveLength(0);
    expect($('#spent-attention .spec-words input[type="radio"], #spent-attention .spec-words label')).toHaveLength(0);
  });

  it('shows only the Visual idea collapsible for a Slide the Dossier has not reached', () => {
    // ARRANGE
    const kinds = ['visual-idea'];
    // ACT
    const $ = page(BRIEF_ONLY);
    // ASSERT
    expect(ids($, '#spent-attention .spec-words > details', 'data-panel')).toEqual(kinds);
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
    expect(slide.find('details.spec-build [data-spec="build-notes"]')).toHaveLength(optionIds.length);
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

  it('puts the context cards in one row of collapsibles, closed by default, each holding its own heading and body', () => {
    // ARRANGE
    const cards = ['brief', 'style', 'visual-language', 'episode-page'];
    const headings = ['Brief', 'Style', 'Visual language', 'Episode page'];
    // ACT
    const $ = page({ ...FULL, brief: CARD_BRIEF });
    const row = $('.spec-intro');
    // ASSERT
    expect(
      row
        .children('section')
        .map((_, card) => $(card).attr('id'))
        .get(),
    ).toEqual(cards);
    expect(row.find('details').length).toBe(cards.length);
    expect(row.find('details[open]')).toHaveLength(0);
    expect(
      row
        .find('summary h2')
        .map((_, heading) => $(heading).text())
        .get(),
    ).toEqual(headings);
  });

  it('keeps the Visual language note field inside its collapsible, tied to the review form', () => {
    // ARRANGE
    const selector = '#visual-language details textarea[form="spec-review"][name="note:visual-language"]';
    // ACT
    const $ = page(FULL);
    // ASSERT
    expect($(selector)).toHaveLength(1);
  });

  it('links each context card from the outline, so a link opens the card it names', () => {
    // ARRANGE
    const links = ['#brief', '#style', '#visual-language', '#episode-page'];
    // ACT
    const $ = page({ ...FULL, brief: CARD_BRIEF });
    const hrefs = $('.spec-outline a')
      .map((_, link) => $(link).attr('href'))
      .get();
    // ASSERT
    expect(hrefs.slice(0, links.length)).toEqual(links);
  });

  it('clones the item template once per Slide, Title slide included, with its item attributes set', () => {
    // ARRANGE
    const items = ['top', 'spent-attention', 'the-quiet-middle', 'trim-the-paste'];
    const [titleSlide, slide] = items as [string, string];
    const fidelities = items.map(() => FIDELITY);
    const slideNumber = '1';
    const slideTitle = 'Spent attention';
    const titleRole = 'title-slide';
    // ACT
    const $ = page(FULL);
    // ASSERT
    expect(ids($, '[data-item]', 'data-item')).toEqual(items);
    expect(ids($, '[data-item]', 'data-fidelity')).toEqual(fidelities);
    expect($(`article#${slide}`).attr('data-item')).toBe(slide);
    expect($(`article#${titleSlide}`).attr('data-spec')).toBe(titleRole);
    expect($(`article#${titleSlide}`).attr('data-number')).toBeUndefined();
    expect($(`#${slide} .spec-number`).text()).toBe(slideNumber);
    expect($(`#${slide} h3`).text()).toBe(slideTitle);
  });

  it('clones the Option template per fragment Option: its id, recommendation as true or false, mock, caption and pick slot', () => {
    // ARRANGE
    const expected = [
      ['1a', 'true'],
      ['1b', 'false'],
    ];
    const first = { id: '1a', mock: 'Mock 1a', caption: '1a A reason. Build cost: Scene.' };
    // ACT
    const $ = page(FULL);
    const options = $('#spent-attention figure[data-spec="option"]');
    // ASSERT
    expect(
      options.map((_, figure) => [[$(figure).attr('data-option'), $(figure).attr('data-recommended')]]).get(),
    ).toEqual(expected);
    expect(options.first().find('[data-spec="mock"]').text()).toBe(first.mock);
    expect(options.first().find('figcaption').text()).toBe(first.caption);
    expect(options.first().find('.spec-pick b').text()).toBe(first.id);
    expect(options.first().find('input[name="pick:spent-attention"]').attr('value')).toBe(first.id);
  });

  it('keeps the echoes of a Title-slide Option in its stage', () => {
    // ARRANGE
    const echoes = ['why-it-forgets', 'spend-it-well'];
    // ACT
    const $ = page(FULL);
    // ASSERT
    expect(ids($, '#top figure[data-option="0a"] [data-spec="echo"]', 'data-section')).toEqual(echoes);
  });

  it('sets data-revision to the Gate round: one past the feedback rounds saved so far', () => {
    // ARRANGE
    const round = (n: number) => feedback(n, '- `top` · design — picked: 0a');
    // ACT
    const expected = ['1', '2', '3'];
    const revisions = [[], [round(1)], [round(1), round(2)]].map((rounds) =>
      page({ ...FULL, feedback: rounds })('html').attr('data-revision'),
    );
    // ASSERT
    expect(revisions).toEqual(expected);
  });

  it('leaves no template, slot marker or placeholder behind in the page', () => {
    // ARRANGE
    const html = assembleSpec(FULL);
    // ACT
    const $ = load(html);
    // ASSERT
    expect($('template')).toHaveLength(0);
    expect($('[data-slot]')).toHaveLength(0);
    expect($('[data-item=""], [data-option=""]')).toHaveLength(0);
  });

  it('drops the Option and note slots of a Slide that has no Options yet, but keeps its item attributes', () => {
    // ARRANGE
    const expected = { item: 'spent-attention', fidelity: FIDELITY };
    const purpose = 'the window fills';
    // ACT
    const $ = page(BRIEF_ONLY);
    const slide = $('#spent-attention');
    // ASSERT
    expect(slide.find('.spec-options, .spec-note')).toHaveLength(0);
    expect(slide.find('.spec-purpose').text()).toContain(purpose);
    expect({ item: slide.attr('data-item'), fidelity: slide.attr('data-fidelity') }).toEqual(expected);
  });

  it('locks a Slide with exactly one pick: data-picked on the Option, checked on its box alone', () => {
    // ARRANGE
    const round = feedback(
      1,
      '- `top` · design — picked: 0b',
      '- `why-it-forgets--spent-attention` · design — picked: 1b — tighter',
    );
    const [slidePick, titlePick] = ['1b', '0b'];
    // ACT
    const $ = page({ ...FULL, feedback: [round] });
    // ASSERT
    expect($('#spent-attention figure[data-picked]').attr('data-option')).toBe(slidePick);
    expect($('#spent-attention input[type="checkbox"][checked]').attr('value')).toBe(slidePick);
    expect($('#top figure[data-picked]').attr('data-option')).toBe(titlePick);
    expect($('#the-quiet-middle figure[data-picked]')).toHaveLength(0);
  });

  it('keeps its locks across a round that carries the page and next lines', () => {
    // ARRANGE
    const round = feedback(
      1,
      '- `why-it-forgets--spent-attention` · design — picked: 1b',
      '- `page` · design — Calmer overall.',
      '- `next` · gate — redesign',
    );
    const slidePick = '1b';
    // ACT
    const $ = page({ ...FULL, feedback: [round] });
    // ASSERT
    expect($('#spent-attention figure[data-picked]').attr('data-option')).toBe(slidePick);
    expect($('figure[data-picked]')).toHaveLength(1);
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
      checkSpec({ 'spec/spec.html': html, 'dossier.md': DOSSIER }).map(({ message }) => message),
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

  it('shows every Brief heading Han reviews, in Brief order, with a note field each, keyed brief--<heading-slug>', () => {
    // ARRANGE
    const brief = CARD_BRIEF;
    const actionable = 'Trim pastes.';
    const analogyEnd = 'The desk never grows.';
    // ACT
    const $ = page({ ...BASE, brief });
    // ASSERT
    expect(
      $('[data-spec="brief-card"] h3')
        .map((_, h) => $(h).text())
        .get(),
    ).toEqual([
      'Format',
      'Audience',
      'Style',
      'Learning goal',
      'Actionables',
      'Hook',
      'Red thread',
      'Analogy',
      'Constraints',
      'Research questions',
    ]);
    expect(ids($, '[data-spec="brief-card"] textarea', 'name')).toEqual([
      'note:brief--format',
      'note:brief--audience',
      'note:brief--style',
      'note:brief--learning-goal',
      'note:brief--actionables',
      'note:brief--hook',
      'note:brief--red-thread',
      'note:brief--analogy',
      'note:brief--constraints',
      'note:brief--research-questions',
    ]);
    expect($('[data-spec="brief-card"]').text()).toContain(actionable);
    expect($('[data-spec="brief-card"]').text()).toContain(analogyEnd);
  });

  it('is read-only once the Brief is approved: the text stays, the note fields go', () => {
    // ARRANGE
    const brief = APPROVED_BRIEF;
    // ACT
    const $ = page({ ...BASE, brief });
    // ASSERT
    expect($('[data-spec="brief-card"]').text()).toContain('Know the budget.');
    expect($('[data-spec="brief-card"] textarea')).toHaveLength(0);
    expect($('[data-spec="brief-card"][data-locked]')).toHaveLength(1);
  });
});

describe('failure cases', () => {
  it('refuses a template with a slot the assembler does not fill, naming it', () => {
    // ARRANGE
    const slot = 'ledger';
    const template = TEMPLATE.replace('data-slot="lede"', `data-slot="${slot}"`);
    // ACT
    const run = () => assembleSpec({ ...FULL, template });
    // ASSERT
    expect(run).toThrow(`"${slot}"`);
  });

  it('refuses a template without its item or Option template', () => {
    // ARRANGE
    const missing = 'option';
    const template = TEMPLATE.replace(`data-template="${missing}"`, 'data-template="choice"');
    // ACT
    const run = () => assembleSpec({ ...FULL, template });
    // ASSERT
    expect(run).toThrow(`"${missing}"`);
  });

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
  it('leaves a Slide with zero or several picks unlocked, on its recommended Option', () => {
    // ARRANGE
    const round = feedback(
      1,
      '- `why-it-forgets--spent-attention` · design — picked: 1a, 1b',
      '- `why-it-forgets--the-quiet-middle` · design — picked: none — try columns',
    );
    // ACT
    const $ = page({ ...FULL, feedback: [round] });
    // ASSERT
    const recommended = $('figure[data-recommended="true"]')
      .toArray()
      .map((figure) => $(figure).attr('data-option'));
    const ticked = $('input[type="checkbox"][checked]')
      .toArray()
      .map((box) => $(box).attr('value'));
    expect($('figure[data-picked]')).toHaveLength(0);
    expect(ticked).toEqual(recommended);
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
