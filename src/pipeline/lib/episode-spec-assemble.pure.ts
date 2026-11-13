/*
 * `assembleSpec(inputs) → html` (design-ADR 0011): the Spec page's whole structure, so agents supply content only,
 * the designers' fragments and the Visual language. The Spec template (`assets/spec-template.html`, authored by
 * `to-decision-html`) owns the frame, the review form and the markup of an item and of an Option; this module clones
 * its two `<template>`s, fills their named slots and sets `data-item`, `data-fidelity`, `data-option`,
 * `data-recommended` and `data-revision`, the `data-picked`/`checked` locks read from every feedback round included.
 * It also builds what the template has no slot markup for: the outline, the intro cards and the Section bands.
 * Inputs are optional by stage and the page renders what exists: the Brief alone gives Slide cards, plus the Dossier
 * the words, plus fragments the Options. It refuses an approved Spec.
 */

import { load } from 'cheerio';
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { briefCardMarkup } from './episode-spec-assemble-brief.pure.ts';
import { inline, notesList, visualPanel, voiceList, wordTabs } from './episode-spec-assemble-words.pure.ts';
import { fragmentSlides } from './episode-spec-fragment.pure.ts';
import { itemMarkup, optionsMarkup, type Templates } from './episode-spec-items.pure.ts';
import { FORM } from './episode-spec-slide.pure.ts';
import { briefSource, dossierSlug, dossierSource, mergedSource, type Source } from './episode-spec-source.pure.ts';
import { fillIn, templateOf, type Slot } from './episode-spec-template.pure.ts';
import { metaGateTier } from './staging-file.pure.ts';

export interface SpecInputs {
  /** The Spec template asset: a page frame with `data-slot` elements and an item and an Option `<template>`. */
  template: string;
  /** `generated` of the meta block: the caller's stamp, never invented here. */
  generated: { by: string; at: string };
  brief: string;
  dossier?: string;
  /** The designers' fragment files, each `<!-- slide: <slug> -->` markers then Option figures. */
  fragments?: readonly string[];
  /** Markup inside the Visual language and Episode page cards. */
  visualLanguage?: string;
  episodePage?: string;
  /** Every feedback round's `feedback.md`, oldest first. */
  feedback?: readonly string[];
  /** The current `spec.html`, if any; assembly refuses when it is approved. */
  existing?: string;
  locale?: string;
}

/** The picks that lock a Slide: its latest feedback item with exactly one pick, by Slide slug. */
const PICK_LINE = /^- `([a-z0-9-]+(?:--[a-z0-9-]+)?)` · design — picked: (none|\d+[a-z](?:, \d+[a-z])*)/;

/** A feedback line's Slide slug and the Options it picked, none for a line of another form. */
function pickOf(line: string): { slug: string; picks: string[] } | undefined {
  const item = PICK_LINE.exec(line);
  if (item === null) return undefined;
  return {
    slug: (item[1] ?? '').split('--').at(-1) ?? '',
    picks: (item[2] ?? '').split(', ').filter((pick) => pick !== 'none'),
  };
}

function locksOf(rounds: readonly string[]): Map<string, string> {
  const locks = new Map<string, string>();
  const picked = rounds.flatMap((round) => round.split('\n').flatMap((line) => pickOf(line) ?? []));
  for (const { slug, picks } of picked) {
    if (picks.length === 1) locks.set(slug, picks[0] ?? '');
    else locks.delete(slug);
  }
  return locks;
}

/** What the Options of a page come from: the designers' fragments by Slide slug, Han's locked picks and the template. */
interface Parts {
  fragments: Map<string, string>;
  locks: Map<string, string>;
  templates: Templates;
}

type SourceSlide = Source['sections'][number]['slides'][number];

function slideWords(slide: SourceSlide): string {
  return wordTabs(slide.slug, {
    'visual-idea': visualPanel(slide.visual),
    'voice-script': voiceList(slide.voice),
    'speaker-notes': slide.notes === undefined ? '' : notesList(slide.notes),
  });
}

function slideMarkup(slide: SourceSlide, number: number, { fragments, locks, templates }: Parts): string {
  const html = fragments.get(slide.slug);
  const locked = locks.get(slide.slug);
  const options =
    html === undefined ? undefined : optionsMarkup({ slug: slide.slug, html, template: templates.option, locked });
  const purpose = slide.purpose === undefined ? undefined : inline(slide.purpose);
  const item = {
    id: slide.slug,
    role: 'slide' as const,
    number,
    title: inline(slide.title),
    purpose,
    words: slideWords(slide),
    options,
    notePlaceholder: `Note on Slide ${number}`,
  };
  return itemMarkup(item, templates.item);
}

const TITLE_PURPOSE =
  'Each Option is a set: the Title slide, which sets the Hero motif, and under it the section slide of every Section, which echoes the motif and brings in its own Section. Picking an Option picks the set.';

function titleArticle(html: string, { locks, templates }: Parts): string {
  const locked = locks.get(TITLE_ANCHOR);
  const item = {
    id: TITLE_ANCHOR,
    role: 'title-slide' as const,
    number: 0,
    title: 'Title slide and section slides',
    purpose: TITLE_PURPOSE,
    options: optionsMarkup({ slug: TITLE_ANCHOR, html, template: templates.option, locked }),
    notePlaceholder: 'Note on the Title slide and section slides',
  };
  return itemMarkup(item, templates.item);
}

/** The outline's list: the Title slide, then each Section with its Slides. */
function outline(source: Source, hasTitle: boolean): string {
  let number = 0;
  const groups = source.sections.map(
    ({ title, slides }) =>
      `<li><span class="spec-outline-section">${inline(title)}</span><ol>\n${slides
        .map((slide) => `<li><a href="#${slide.slug}">${++number} · ${inline(slide.title)}</a></li>`)
        .join('\n')}\n</ol></li>`,
  );
  const top = hasTitle
    ? [
        `<li><span class="spec-outline-section">Episode</span><ol>\n<li><a href="#${TITLE_ANCHOR}">0 · Title slide and section slides</a></li>\n</ol></li>`,
      ]
    : [];
  return `<ol>\n${[...top, ...groups].join('\n')}\n</ol>`;
}

/** The intro cards: Brief, Style, Visual language and Episode page, as far as the inputs hold them. */
function intro(inputs: SpecInputs, source: Source): string {
  return [
    briefCardMarkup(inputs.brief),
    source.style === undefined
      ? ''
      : `<section id="style" class="spec-card">\n<h2>Style</h2>\n<p>${inline(source.style)}</p>\n</section>`,
    inputs.visualLanguage === undefined
      ? ''
      : `<section id="visual-language" class="spec-card">\n<h2>Visual language</h2>\n${inputs.visualLanguage}\n<textarea class="spec-note" form="${FORM}" name="note:visual-language" placeholder="Note on the Visual language"></textarea>\n</section>`,
    inputs.episodePage === undefined
      ? ''
      : `<section id="episode-page" class="spec-card">\n<h2>Episode page</h2>\n${inputs.episodePage}\n</section>`,
  ]
    .filter(Boolean)
    .join('\n');
}

const LEDE =
  'Each Slide shows its words as tabs above its Options, which are tabs too: open each, pick one, and dictate a note where it should change. Save at the bottom when done.';

function sectionsMarkup(source: Source, parts: Parts): string {
  let number = 0;
  return source.sections
    .map(
      (section, at) => `<section data-spec="section" id="${section.slug}">
<div class="spec-section-band">
<p class="spec-kicker">Section ${at + 1} · section slide, drawn in the Title-slide Options</p>
<h2>${inline(section.title)}</h2>
${voiceList(section.voice)}
</div>
${section.slides.map((slide) => slideMarkup(slide, ++number, parts)).join('\n')}
</section>`,
    )
    .join('\n');
}

function metaJson(inputs: SpecInputs, title: string): string {
  const meta = {
    type: 'spec',
    title,
    status: 'draft',
    generated: inputs.generated,
    locale: inputs.locale ?? 'en',
    brief: '../brief.md',
  };
  return `\n${JSON.stringify(meta, null, 2)}\n`;
}

/** The designers' fragments by Slide slug. */
function fragmentsBySlug(files: readonly string[]): Map<string, string> {
  return new Map(files.flatMap((file) => fragmentSlides(file).map(({ slug, html }) => [slug, html.trim()] as const)));
}

/** What fills the page frame's slots: the title, meta block, outline, masthead, intro cards and every item. */
function frameSlots(inputs: SpecInputs, source: Source, parts: Parts): Record<string, Slot> {
  const titleOptions = parts.fragments.get(TITLE_ANCHOR);
  const title = titleOptions === undefined ? '' : titleArticle(titleOptions, parts);
  const count = source.sections.reduce((sum, { slides }) => sum + slides.length, 0);
  return {
    'page-title': (element) => void element.text(`Spec · ${source.title}`),
    meta: (element) => void element.text(metaJson(inputs, source.title)),
    outline: outline(source, titleOptions !== undefined),
    kicker: `Spec · ${count} Slides`,
    heading: (element) => {
      element.html(inline(source.title));
      if (source.slug !== undefined) element.attr('id', source.slug);
    },
    lede: LEDE,
    intro: intro(inputs, source),
    items: `${title}\n${sectionsMarkup(source, parts)}`,
  };
}

/** The Spec page for whatever the inputs hold; throws when `existing` is an approved Spec. */
export function assembleSpec(inputs: SpecInputs): string {
  if (inputs.existing !== undefined && metaGateTier(inputs.existing) === 'approved')
    throw new Error('the Spec is approved: an approved Spec cannot be assembled again');
  const brief = briefSource(inputs.brief);
  const source = inputs.dossier === undefined ? brief : mergedSource(brief, dossierSource(inputs.dossier));
  const rounds = inputs.feedback ?? [];
  const $ = load(inputs.template);
  const templates = { item: templateOf($, 'item'), option: templateOf($, 'option') };
  $('template').remove();
  const parts = { fragments: fragmentsBySlug(inputs.fragments ?? []), locks: locksOf(rounds), templates };
  fillIn($, frameSlots(inputs, source, parts));
  // The Gate round: the draft after n saved feedback rounds is round n + 1.
  const pageId = source.slug ?? dossierSlug(source.title);
  $('html').attr({ 'data-page-id': pageId, 'data-revision': String(rounds.length + 1) });
  return `${$.html()}\n`;
}
