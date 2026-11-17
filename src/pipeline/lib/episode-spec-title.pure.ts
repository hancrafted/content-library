// decision: docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { type CheerioAPI } from 'cheerio';
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { OPTION, SECTION, specSectionSlugs, TITLE_SLIDE, type Spec } from './episode-spec-page.pure.ts';
import {
  anyPicked,
  checkOption,
  checkOptionMarks,
  FORM,
  type OptionCount,
  type Selection,
} from './episode-spec-slide.pure.ts';
import { unless } from './finding.pure.ts';

const TITLE_SLIDE_OPTIONS: OptionCount = { min: 3, max: 3, words: 'three' };
const WHERE = `The Title slide {#${TITLE_ANCHOR}}`;

function checkSet(figure: Selection, sections: readonly string[]): string[] {
  const where = `Option ${figure.attr('data-option') ?? ''} of {#${TITLE_ANCHOR}}`;
  const echoes = figure
    .find('[data-spec="echoes"] [data-spec="echo"]')
    .toArray()
    .map((echo) => echo.attribs['data-section'] ?? '');
  return [
    ...unless(
      figure.find('[data-spec="mock"]').not('[data-spec="echo"] [data-spec="mock"]').length > 0,
      `${where} has no mock of the Title slide: a <div data-spec="mock"> in its figure, beside the echoes.`,
    ),
    ...unless(
      echoes.join() === sections.join(),
      `${where} shows the section slides [${echoes.join(', ')}], not one per Section in Spec order: [${sections.join(', ')}].`,
    ),
  ];
}

export function checkTitleSlide(spec: Spec): string[] {
  const { $ } = spec.main;
  const articles = $(TITLE_SLIDE);
  if (articles.length === 0)
    return [
      `The Spec has no Title slide: an <article data-spec="title-slide" id="${TITLE_ANCHOR}"> before the first Section, its three Options each the Title slide and a section slide per Section.`,
    ];
  if (articles.length > 1) return [`The Spec has ${articles.length} Title slides: keep one.`];
  const id = articles.attr('id') ?? '';
  if (id !== TITLE_ANCHOR)
    return [`The Title slide is id "${id}": id it "${TITLE_ANCHOR}", the anchor feedback keys it by.`];
  return [...checkOrder($, articles), ...checkTitleOptions($, articles, spec)];
}

function checkOrder($: CheerioAPI, article: Selection): string[] {
  const first = $(SECTION).first();
  if (first.length === 0) return [];
  const all = $('*');
  return unless(
    all.index(article) < all.index(first),
    `${WHERE} comes after the Section {#${first.attr('id') ?? ''}}: put it before the first Section.`,
  );
}

function checkTitleOptions($: CheerioAPI, article: Selection, spec: Spec): string[] {
  const sections = specSectionSlugs(spec);
  const { approved } = spec;
  const figures = article
    .find(OPTION)
    .toArray()
    .map((figure) => $(figure));
  return [
    ...checkOptionMarks(figures, WHERE, { number: 0, approved, count: TITLE_SLIDE_OPTIONS }),
    ...figures.flatMap((figure) => [
      ...checkOption($, figure, { slug: TITLE_ANCHOR, slidePicked: anyPicked(figures) }),
      ...checkSet(figure, sections),
    ]),
    ...unless(
      article.find(`textarea[form="${FORM}"][name="note:${TITLE_ANCHOR}"]`).length === 1,
      `${WHERE} has no <textarea form="${FORM}" name="note:${TITLE_ANCHOR}">.`,
    ),
  ];
}
