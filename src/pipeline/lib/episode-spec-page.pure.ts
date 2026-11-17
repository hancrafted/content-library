// decision: docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { load, type CheerioAPI } from 'cheerio';
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { metaBlockText, metaGateTier } from './staging-file.pure.ts';

export const SPEC_FILE = 'spec/spec.html';
export const SECTION = 'section[data-spec="section"]';
export const SLIDE = 'article[data-spec="slide"]';
export const OPTION = 'figure[data-spec="option"]';
export const TITLE_SLIDE = 'article[data-spec="title-slide"]';

export type SpecStage = 'early' | 'options';

export interface SpecSlide {
  section: string;
  slug: string;
  options: readonly string[];
}

export interface SpecPage {
  readonly file: string;
  readonly $: CheerioAPI;
}

export interface Spec {
  readonly pages: readonly SpecPage[];
  readonly main: SpecPage;
  readonly meta: string | undefined;
  readonly approved: boolean;
  readonly stage: SpecStage;
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

export function readSpec(files: Readonly<Record<typeof SPEC_FILE, string>>): Spec;
export function readSpec(files: Readonly<Record<string, string>>): Spec | undefined;
export function readSpec(files: Readonly<Record<string, string>>): Spec | undefined {
  const text = files[SPEC_FILE];
  if (text === undefined) return undefined;
  const main = specPage(SPEC_FILE, text);
  const pages = [main];
  let stage: SpecStage | undefined;
  let slides: readonly SpecSlide[] | undefined;
  return {
    pages,
    main,
    meta: metaBlockText(text),
    approved: metaGateTier(text) === 'approved',
    get stage() {
      stage ??= pagesStage(pages);
      return stage;
    },
    get slides() {
      slides ??= pages.flatMap(pageSlides);
      return slides;
    },
  };
}

export function specSlideAnchors(spec: Spec): string[] {
  return spec.slides.map(({ section, slug }) => `${section}--${slug}`);
}

export function specSectionSlugs(spec: Spec): string[] {
  return spec.pages.flatMap(({ $ }) =>
    $(SECTION)
      .toArray()
      .map((section) => $(section).attr('id') ?? ''),
  );
}

export function specTitleSlideOptions(spec: Spec): string[] | undefined {
  const { $ } = spec.main;
  const article = $(`${TITLE_SLIDE}#${TITLE_ANCHOR}`).first();
  if (article.length === 0) return undefined;
  return article
    .find(OPTION)
    .toArray()
    .map((option) => $(option).attr('data-option') ?? '');
}

export function specBriefKeys(spec: Spec): string[] {
  const { $ } = spec.main;
  return $('[data-spec="brief-card"] textarea')
    .toArray()
    .map((field) => ($(field).attr('name') ?? '').replace(/^note:/, ''));
}
