/*
 * `assembleSpec(inputs) → html` (design-ADR 0011): the Spec page's whole structure, so agents supply content only,
 * the designers' fragments and the Visual language. It fills the Spec template (`assets/spec-template.html`), whose
 * slots, attributes and feedback locks the Spec calibration lists (`skills/new-episode/references/spec-calibration.md`),
 * and builds what the template has no slot markup for: the outline, the intro cards and the Section bands.
 * Inputs are optional by stage and the page renders what exists: the Brief alone gives Slide cards, plus the Dossier
 * the words, plus fragments the Options. It refuses an approved Spec.
 */

import { load } from 'cheerio';
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { briefCardMarkup } from './episode-spec-assemble-brief.pure.ts';
import {
  collapsible,
  inline,
  notesList,
  visualPanel,
  voiceList,
  wordPanels,
} from './episode-spec-assemble-words.pure.ts';
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

/** What the items of a page come from: the designers' fragments by Slide slug, Han's locked picks and the template. */
interface SlideSources {
  fragments: Map<string, string>;
  locks: Map<string, string>;
  templates: Templates;
}

type SourceSlide = Source['sections'][number]['slides'][number];

function slideWords(slide: SourceSlide): string {
  return wordPanels({
    'visual-idea': visualPanel(slide.visual),
    'voice-script': voiceList(slide.voice),
    'speaker-notes': slide.notes === undefined ? '' : notesList(slide.notes),
  });
}

function slideMarkup(slide: SourceSlide, number: number, { fragments, locks, templates }: SlideSources): string {
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

function titleArticle(html: string, { locks, templates }: SlideSources): string {
  const locked = locks.get(TITLE_ANCHOR);
  const item = {
    id: TITLE_ANCHOR,
    role: 'title-slide' as const,
    title: 'Title slide and section slides',
    purpose: TITLE_PURPOSE,
    options: optionsMarkup({ slug: TITLE_ANCHOR, html, template: templates.option, locked }),
    notePlaceholder: 'Note on the Title slide and section slides',
  };
  return itemMarkup(item, templates.item);
}

/** One context card of the intro: its anchor, its name in the outline and its markup. */
interface IntroCard {
  id: string;
  label: string;
  html: string;
}

/** A context card: a section holding a collapsible, closed by default, named by its anchor. */
function introCard(id: string, label: string, body: string): IntroCard {
  return { id, label, html: `<section id="${id}" class="spec-card">\n${collapsible(label, body)}\n</section>` };
}

/** The intro cards: Brief, Style, Visual language and Episode page, as far as the inputs hold them. */
function introCards(inputs: SpecInputs, source: Source): IntroCard[] {
  const note = `<textarea class="spec-note" form="${FORM}" name="note:visual-language" placeholder="Note on the Visual language"></textarea>`;
  const cards: IntroCard[] = [{ id: 'brief', label: 'Brief', html: briefCardMarkup(inputs.brief) }];
  if (source.style !== undefined) cards.push(introCard('style', 'Style', `<p>${inline(source.style)}</p>`));
  if (inputs.visualLanguage !== undefined)
    cards.push(introCard('visual-language', 'Visual language', `${inputs.visualLanguage}\n${note}`));
  if (inputs.episodePage !== undefined) cards.push(introCard('episode-page', 'Episode page', inputs.episodePage));
  return cards.filter(({ html }) => html !== '');
}

/** The outline's list: the context cards, the Title slide, then each Section with its Slides. */
function outline(source: Source, hasTitle: boolean, cards: readonly IntroCard[]): string {
  let number = 0;
  const group = (name: string, links: readonly string[]) =>
    `<li><span class="spec-outline-section">${name}</span><ol>\n${links.join('\n')}\n</ol></li>`;
  const context =
    cards.length === 0
      ? []
      : [
          group(
            'Context',
            cards.map(({ id, label }) => `<li><a href="#${id}">${label}</a></li>`),
          ),
        ];
  const sections = source.sections.map(({ title, slides }) =>
    group(
      inline(title),
      slides.map((slide) => `<li><a href="#${slide.slug}">${++number} · ${inline(slide.title)}</a></li>`),
    ),
  );
  const top = hasTitle
    ? [group('Episode', [`<li><a href="#${TITLE_ANCHOR}">0 · Title slide and section slides</a></li>`])]
    : [];
  return `<ol>\n${[...context, ...top, ...sections].join('\n')}\n</ol>`;
}

const LEDE =
  'Each Slide shows its Options as a visual with a pick bar beside it: pick one, open its details to compare, and dictate a note where it should change. Its words sit in the rail, closed. Save at the bottom when done.';

function sectionsMarkup(source: Source, sources: SlideSources): string {
  let number = 0;
  return source.sections
    .map(
      (section, at) => `<section data-spec="section" id="${section.slug}">
<div class="spec-section-band">
<p class="spec-kicker">Section ${at + 1} · section slide, drawn in the Title-slide Options</p>
<h2>${inline(section.title)}</h2>
${voiceList(section.voice)}
</div>
${section.slides.map((slide) => slideMarkup(slide, ++number, sources)).join('\n')}
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
function frameSlots(inputs: SpecInputs, source: Source, sources: SlideSources): Record<string, Slot> {
  const titleOptions = sources.fragments.get(TITLE_ANCHOR);
  const title = titleOptions === undefined ? '' : titleArticle(titleOptions, sources);
  const cards = introCards(inputs, source);
  const count = source.sections.reduce((sum, { slides }) => sum + slides.length, 0);
  return {
    'page-title': (element) => void element.text(`Spec · ${source.title}`),
    meta: (element) => void element.text(metaJson(inputs, source.title)),
    outline: outline(source, titleOptions !== undefined, cards),
    kicker: `Spec · ${count} Slides`,
    heading: (element) => {
      element.html(inline(source.title));
      if (source.slug !== undefined) element.attr('id', source.slug);
    },
    lede: LEDE,
    intro: cards.map(({ html }) => html).join('\n'),
    items: `${title}\n${sectionsMarkup(source, sources)}`,
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
  const sources = { fragments: fragmentsBySlug(inputs.fragments ?? []), locks: locksOf(rounds), templates };
  fillIn($, frameSlots(inputs, source, sources));
  // The Gate round: the draft after n saved feedback rounds is round n + 1.
  const pageId = source.slug ?? dossierSlug(source.title);
  $('html').attr({ 'data-page-id': pageId, 'data-revision': String(rounds.length + 1) });
  return `${$.html()}\n`;
}
