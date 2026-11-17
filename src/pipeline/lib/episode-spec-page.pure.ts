/*
 * The Spec read from a staging folder (design-ADR 0011): `readSpec` turns the folder's files into one Spec value,
 * and every Spec reader takes that value, so no reader parses a page itself. A Spec is made of pages, one per Spec
 * file; today that is `spec/spec.html` alone. Whole-Spec facts sit on the Spec, per-page work on its `SpecPage`s, and
 * each page is parsed on first use: parsing a Spec with its inline SVG mocks costs far more than any read of it.
 * Splitting a Spec into per-Section files (issue #669) changes only how `readSpec` finds the pages.
 * It imports nothing but `cheerio` and `.ts` paths whose own imports are as bare, so the new-episode scripts run it
 * under bare node.
 */

import { load, type CheerioAPI } from 'cheerio';
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { metaBlockText, metaGateTier } from './staging-file.pure.ts';

/** The Spec's main page, relative to the Episode's staging folder. */
export const SPEC_FILE = 'spec/spec.html';
export const SECTION = 'section[data-spec="section"]';
export const SLIDE = 'article[data-spec="slide"]';
export const OPTION = 'figure[data-spec="option"]';
export const TITLE_SLIDE = 'article[data-spec="title-slide"]';

/** `early`: a Brief- or Dossier-stage Spec, before the designers' Options exist, so only what that stage holds is checked. */
export type SpecStage = 'early' | 'options';

/** One Slide of the Spec: the Section it sits in, its slug and its Option ids in page order. */
export interface SpecSlide {
  section: string;
  slug: string;
  options: readonly string[];
}

/** One file of a Spec: its path relative to the staging folder, and the page parsed on first read of `$`. */
export interface SpecPage {
  readonly file: string;
  readonly $: CheerioAPI;
}

/** A Spec: its pages, main page first, and the facts of the whole Spec. */
export interface Spec {
  readonly pages: readonly SpecPage[];
  /** The main page's text. */
  readonly text: string;
  /** The JSON text of the main page's meta block, or `undefined` when it has none. */
  readonly meta: string | undefined;
  /** Whether Han approved the Spec, read from the meta block's `verified` list. */
  readonly approved: boolean;
  /**
   * `early` when the Spec holds Slides but no Option and no Title slide, which is how a Brief- or Dossier-stage
   * assembly looks; `options` otherwise, so a Spec with a Title slide, an Option or no Slide at all gets the whole
   * contract.
   */
  readonly stage: SpecStage;
  /** The Slides inside a Section, the pages' Slides in page order; a Slide in no Section has no anchor, so it is no Slide here. */
  readonly slides: readonly SpecSlide[];
}

function specPage(file: string, text: string): SpecPage {
  let parsed: CheerioAPI | undefined;
  return {
    file,
    get $() {
      parsed ??= load(text);
      return parsed;
    },
  };
}

function pageSlides({ $ }: SpecPage): SpecSlide[] {
  return $(`${SECTION} ${SLIDE}`)
    .toArray()
    .map((slide) => ({
      section: $(slide).closest(SECTION).attr('id') ?? '',
      slug: $(slide).attr('id') ?? '',
      options: $(slide)
        .find(OPTION)
        .toArray()
        .map((option) => $(option).attr('data-option') ?? ''),
    }));
}

function pagesStage(pages: readonly SpecPage[]): SpecStage {
  const count = (selector: string) => pages.reduce((sum, { $ }) => sum + $(selector).length, 0);
  return count(SLIDE) > 0 && count(OPTION) === 0 && count(TITLE_SLIDE) === 0 ? 'early' : 'options';
}

/**
 * The Spec of a staging folder, or `undefined` before `spec/spec.html` exists. `files` maps a path relative to the
 * folder to its text. No page is parsed until a reader needs it.
 */
export function readSpec(files: Readonly<Record<typeof SPEC_FILE, string>>): Spec;
export function readSpec(files: Readonly<Record<string, string>>): Spec | undefined;
export function readSpec(files: Readonly<Record<string, string>>): Spec | undefined {
  const text = files[SPEC_FILE];
  if (text === undefined) return undefined;
  const pages = [specPage(SPEC_FILE, text)];
  let slides: readonly SpecSlide[] | undefined;
  return {
    pages,
    text,
    meta: metaBlockText(text),
    approved: metaGateTier(text) === 'approved',
    get stage() {
      return pagesStage(pages);
    },
    get slides() {
      slides ??= pages.flatMap(pageSlides);
      return slides;
    },
  };
}

/** The page Slide anchors of a Spec, `<section id>--<slide id>` in page order, as feedback items key them. */
export function specSlideAnchors(spec: Spec): string[] {
  return spec.slides.map(({ section, slug }) => `${section}--${slug}`);
}

/** The Section slugs of a Spec in page order, each the anchor feedback items key its section slide by. */
export function specSectionSlugs(spec: Spec): string[] {
  return spec.pages.flatMap(({ $ }) =>
    $(SECTION)
      .toArray()
      .map((section) => $(section).attr('id') ?? ''),
  );
}

/** The Option ids of the Spec's Title slide, on its main page, in page order, or `undefined` when the Spec has none. */
export function specTitleSlideOptions(spec: Spec): string[] | undefined {
  const { $ } = spec.pages[0];
  const article = $(`${TITLE_SLIDE}#${TITLE_ANCHOR}`).first();
  if (article.length === 0) return undefined;
  return article
    .find(OPTION)
    .toArray()
    .map((option) => $(option).attr('data-option') ?? '');
}

/** The Brief card's note keys on the Spec's main page, `brief--<heading-slug>` in page order; none once the card is read-only. */
export function specBriefKeys(spec: Spec): string[] {
  const { $ } = spec.pages[0];
  return $('[data-spec="brief-card"] textarea')
    .toArray()
    .map((field) => ($(field).attr('name') ?? '').replace(/^note:/, ''));
}
