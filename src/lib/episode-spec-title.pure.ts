/*
 * The Spec contract's rules for the Title slide (design-ADR 0011): one
 * `<article data-spec="title-slide" id="top">` with three Options, each a set of
 * the Title slide's mock and, under it, one section slide per Section in page
 * order (`ol[data-spec="echoes"]` of `li[data-spec="echo" data-section]`), so Han
 * judges the Hero motif across the Episode at once. Picking an Option picks the set. It sits
 * before the first Section, as the Title slide opens the Episode.
 */

import { type CheerioAPI } from 'cheerio';
import { TITLE_ANCHOR } from '../episodes/lib/episode.pure.ts';
import { OPTION, SECTION, TITLE_SLIDE } from './episode-spec-page.pure.ts';
import {
  checkOption,
  checkOptionMarks,
  FORM,
  type OptionCount,
  type Selection,
  type SpecPage,
} from './episode-spec-slide.pure.ts';
import { unless } from './finding.pure.ts';

const TITLE_SLIDE_OPTIONS: OptionCount = { min: 3, max: 3, words: 'three' };
const WHERE = `The Title slide {#${TITLE_ANCHOR}}`;

/** The Title slide's mock and its section slides, one per Section of the page in order. */
function checkSet(figure: Selection, sections: readonly string[]): string[] {
  const where = `Option ${figure.attr('data-option') ?? ''} of {#${TITLE_ANCHOR}}`;
  const echoes = figure
    .find('[data-spec="echoes"] [data-spec="echo"]')
    .toArray()
    .map((echo) => echo.attribs['data-section'] ?? '');
  return [
    ...unless(
      figure.children('[data-spec="mock"]').length > 0,
      `${where} has no mock of the Title slide: a <div data-spec="mock"> directly in its figure.`,
    ),
    ...unless(
      echoes.join() === sections.join(),
      `${where} shows the section slides [${echoes.join(', ')}], not one per Section in page order: [${sections.join(', ')}].`,
    ),
  ];
}

/** The rules of the Spec's one Title slide. */
export function checkTitleSlide({ $, approved }: SpecPage): string[] {
  const articles = $(TITLE_SLIDE);
  if (articles.length === 0)
    return [
      `The Spec has no Title slide: an <article data-spec="title-slide" id="${TITLE_ANCHOR}"> before the first Section, its three Options each the Title slide and a section slide per Section.`,
    ];
  if (articles.length > 1) return [`The Spec has ${articles.length} Title slides: keep one.`];
  const id = articles.attr('id') ?? '';
  if (id !== TITLE_ANCHOR)
    return [`The Title slide is id "${id}": id it "${TITLE_ANCHOR}", the anchor feedback keys it by.`];
  return [...checkOrder($, articles), ...checkTitleOptions($, articles, approved)];
}

/** The Title slide opens the Episode, so it sits before the first Section in page order. */
function checkOrder($: CheerioAPI, article: Selection): string[] {
  const first = $(SECTION).first();
  if (first.length === 0) return [];
  const all = $('*');
  return unless(
    all.index(article) < all.index(first),
    `${WHERE} comes after the Section {#${first.attr('id') ?? ''}}: put it before the first Section.`,
  );
}

function checkTitleOptions($: CheerioAPI, article: Selection, approved: boolean): string[] {
  const sections = $(SECTION)
    .toArray()
    .map((section) => $(section).attr('id') ?? '');
  const figures = article
    .find(OPTION)
    .toArray()
    .map((figure) => $(figure));
  return [
    ...checkOptionMarks(figures, WHERE, { number: 0, approved, count: TITLE_SLIDE_OPTIONS }),
    ...figures.flatMap((figure) => [...checkOption($, figure, TITLE_ANCHOR), ...checkSet(figure, sections)]),
    ...unless(
      article.find(`textarea[form="${FORM}"][name="note:${TITLE_ANCHOR}"]`).length === 1,
      `${WHERE} has no <textarea form="${FORM}" name="note:${TITLE_ANCHOR}">.`,
    ),
  ];
}
