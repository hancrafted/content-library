// decision: docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md
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
import { readSpec, SPEC_FILE } from './episode-spec-page.pure.ts';
import { FORM } from './episode-spec-slide.pure.ts';
import { briefSource, dossierSlug, dossierSource, mergedSource, type Source } from './episode-spec-source.pure.ts';
import { fillIn, templateOf, type Slot } from './episode-spec-template.pure.ts';

export interface SpecInputs {
  template: string;
  generated: { by: string; at: string };
  brief: string;
  dossier?: string;
  fragments?: readonly string[];
  visualLanguage?: string;
  episodePage?: string;
  feedback?: readonly string[];
  existing?: string;
  locale?: string;
}

const PICK_LINE = /^- `([a-z0-9-]+(?:--[a-z0-9-]+)?)` · design — picked: (none|\d+[a-z](?:, \d+[a-z])*)/;

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
    notePlaceholder: `Comment on Slide ${number} (optional)`,
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
    notePlaceholder: 'Comment on the Title slide and section slides (optional)',
  };
  return itemMarkup(item, templates.item);
}

interface IntroCard {
  id: string;
  label: string;
  html: string;
}

function introCard(id: string, label: string, body: string): IntroCard {
  return { id, label, html: `<section id="${id}" class="spec-card">\n${collapsible(label, body)}\n</section>` };
}

function introCards(inputs: SpecInputs, source: Source): IntroCard[] {
  const note = `<textarea class="spec-note" form="${FORM}" name="note:visual-language" placeholder="Note on the Visual language"></textarea>`;
  const cards: IntroCard[] = [{ id: 'brief', label: 'Brief', html: briefCardMarkup(inputs.brief) }];
  if (source.style !== undefined) cards.push(introCard('style', 'Style', `<p>${inline(source.style)}</p>`));
  if (inputs.visualLanguage !== undefined)
    cards.push(introCard('visual-language', 'Visual language', `${inputs.visualLanguage}\n${note}`));
  if (inputs.episodePage !== undefined) cards.push(introCard('episode-page', 'Episode page', inputs.episodePage));
  return cards.filter(({ html }) => html !== '');
}

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

function fragmentsBySlug(files: readonly string[]): Map<string, string> {
  return new Map(files.flatMap((file) => fragmentSlides(file).map(({ slug, html }) => [slug, html.trim()] as const)));
}

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

export function assembleSpec(inputs: SpecInputs): string {
  if (inputs.existing !== undefined && readSpec({ [SPEC_FILE]: inputs.existing }).approved)
    throw new Error('the Spec is approved: an approved Spec cannot be assembled again');
  const brief = briefSource(inputs.brief);
  const source = inputs.dossier === undefined ? brief : mergedSource(brief, dossierSource(inputs.dossier));
  const rounds = inputs.feedback ?? [];
  const $ = load(inputs.template);
  const templates = { item: templateOf($, 'item'), option: templateOf($, 'option') };
  $('template').remove();
  const sources = { fragments: fragmentsBySlug(inputs.fragments ?? []), locks: locksOf(rounds), templates };
  fillIn($, frameSlots(inputs, source, sources));
  const pageId = source.slug ?? dossierSlug(source.title);
  const gateRoundAfterSavedFeedbackRounds = rounds.length + 1;
  $('html').attr({ 'data-page-id': pageId, 'data-revision': String(gateRoundAfterSavedFeedbackRounds) });
  return `${$.html()}\n`;
}
