// What the Design archive reads from an Episode's Staging: the Spec's Slides and Options, the feedback items, the
// designer prompts in the run log and the design reference images the Spec cites. Pure text in, records out.

import type { CheerioAPI } from 'cheerio';
import { OPTION, SLIDE, TITLE_SLIDE } from '../../../src/lib/episode-spec-page.pure.ts';
import { TITLE_ANCHOR } from '../../../src/lib/episode.pure.ts';

export interface SlidePage {
  /** The Slide's slug, `top` for the Title slide. */
  slug: string;
  /** The Section's slug; none for the Title slide. */
  section?: string;
  title: string;
  /** The Spec's Visual idea panel, empty when the Slide has none. */
  visualIdea: string;
  options: string[];
  optionIds: string[];
  /** The picked Option's id, if the Spec marks one. */
  picked?: string;
}

export function slidePages($: CheerioAPI): SlidePage[] {
  const pages: SlidePage[] = [];
  $(`${TITLE_SLIDE}#${TITLE_ANCHOR}, ${SLIDE}`).each((_, element) => {
    const article = $(element);
    const slug = article.attr('id') ?? '';
    pages.push({
      slug,
      section: slug === TITLE_ANCHOR ? undefined : article.closest('section[data-spec="section"]').attr('id'),
      title: article.find('h3').first().text().trim(),
      visualIdea: article
        .find('[data-panel="visual-idea"]')
        .toArray()
        .map((panel) => $.html(panel))
        .join(''),
      options: article
        .find(OPTION)
        .map((_i, figure) => $.html(figure))
        .get(),
      picked: article.find(`${OPTION}[data-picked]`).first().attr('data-option'),
      optionIds: article
        .find(OPTION)
        .map((_i, figure) => $(figure).attr('data-option') ?? '')
        .get(),
    });
  });
  return pages;
}

export interface FeedbackItem {
  /** The Slide's anchor: `top`, or `<section>--<slide>`. */
  anchor: string;
  round: number;
  /** The item after its anchor: `<tag> — <note>`. */
  text: string;
}

/** A feedback line, `- \`<anchor>\` · <tag> — <note>`, as `spec-feedback.pure.ts` writes it. */
const FEEDBACK_ITEM = /^- `([^`]+)` · (.+)$/;

export function feedbackItems(files: Readonly<Record<string, string>>): FeedbackItem[] {
  return Object.keys(files)
    .sort()
    .flatMap((file) => {
      const round = Number(/feedback\/(\d+)\//.exec(file)?.[1] ?? 0);
      return (files[file] ?? '').split('\n').flatMap((line) => {
        const match = FEEDBACK_ITEM.exec(line.trim());
        return match ? [{ anchor: match[1] ?? '', round, text: match[2] ?? '' }] : [];
      });
    });
}

export interface Prompt {
  attempt: number;
  t: string;
  text: string;
}

/** A `write-spec` designer's span name in the run log: `write-spec#<attempt>/designer`. */
const DESIGNER = /^write-spec#(\d+)\/designer$/;

/** The designer prompt one run-log line carries, if it is a designer span's start or end. */
function promptOf(line: string): Prompt | undefined {
  if (line.trim() === '') return undefined;
  const event = JSON.parse(line) as { name?: unknown; t?: unknown; 'gen_ai.input.messages'?: unknown };
  const attempt = DESIGNER.exec(String(event.name ?? ''))?.[1];
  const text = event['gen_ai.input.messages'];
  if (attempt === undefined || typeof text !== 'string') return undefined;
  return { attempt: Number(attempt), t: String(event.t ?? ''), text };
}

/** Every distinct designer prompt in the run log, newest attempt first; a span's start and end carry the same one. */
export function designerPrompts(events: string): Prompt[] {
  const prompts = new Map<string, Prompt>();
  for (const prompt of events.split('\n').map(promptOf)) {
    if (prompt !== undefined && !prompts.has(prompt.text)) prompts.set(prompt.text, prompt);
  }
  return [...prompts.values()].sort((a, b) => b.attempt - a.attempt || b.t.localeCompare(a.t));
}

/** A prompt belongs to a Slide when it names the Slide or its Section in code, one of its Options, or the Title slide. */
export function namesSlide(prompt: string, slide: SlidePage): boolean {
  const named = [slide.slug, slide.section].some((slug) => slug !== undefined && prompt.includes(`\`${slug}\``));
  const option = slide.optionIds.some((id) => new RegExp(`\\b${id}\\b`).test(prompt));
  return named || option || (slide.section === undefined && prompt.includes('Title slide'));
}

/** A page image a build note cites by path, `reference/<deck>/pages/page-08.jpg`. */
const PAGE_IMAGE = /reference\/([\w.-]+)\/pages\/(page-\d+\.(?:jpg|jpeg|png|webp))/g;
/** A page a Visual idea cites through its design reference, `reference/<deck>/design-reference.md#page-3`. */
const REFERENCE_PAGE = /reference\/([\w.-]+)\/design-reference\.md#page-(\d+)/g;

/** The page images `html` cites, Staging-relative, sorted; `convert-reference` names page N `page-NN.jpg`. */
export function citedImages(html: string): string[] {
  const images = new Set<string>();
  for (const [, deck, file] of html.matchAll(PAGE_IMAGE)) images.add(`reference/${deck}/pages/${file}`);
  for (const [, deck, page] of html.matchAll(REFERENCE_PAGE)) {
    images.add(`reference/${deck}/pages/page-${(page ?? '').padStart(2, '0')}.jpg`);
  }
  return [...images].sort();
}
