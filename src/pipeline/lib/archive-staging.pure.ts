import type { CheerioAPI } from 'cheerio';
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { OPTION, SLIDE, TITLE_SLIDE } from './episode-spec-page.pure.ts';

export interface SlidePage {
  slug: string;
  section?: string;
  title: string;
  optionIds: string[];
  picked?: string;
  article: string;
  label: string;
}

// decision: docs/decision-records/0004-episode-content-is-staged-then-promoted.md
const REVIEW_ONLY = [
  '.spec-card-head',
  '.spec-bar',
  '.spec-showing',
  '.spec-pick',
  '.spec-note',
  '.spec-words > [data-panel]:not([data-panel="visual-idea"])',
].join(', ');

export function slidePages($: CheerioAPI): SlidePage[] {
  const pages: SlidePage[] = [];
  $(`${TITLE_SLIDE}#${TITLE_ANCHOR}, ${SLIDE}`).each((_, element) => {
    const article = $(element);
    const slug = article.attr('id') ?? '';
    pages.push({
      slug,
      section: slug === TITLE_ANCHOR ? undefined : article.closest('section[data-spec="section"]').attr('id'),
      title: article.find('h3').first().text().trim(),
      picked: article.find(`${OPTION}[data-picked]`).first().attr('data-option'),
      optionIds: article
        .find(OPTION)
        .map((_i, figure) => $(figure).attr('data-option') ?? '')
        .get(),
      article: archivedArticle($, element),
      label: $(`.spec-outline a[href="#${slug}"]`).first().text().trim() || article.find('h3').first().text().trim(),
    });
  });
  return pages;
}

function archivedArticle($: CheerioAPI, element: Parameters<CheerioAPI>[0]): string {
  const article = $(element).clone();
  article.find(REVIEW_ONLY).remove();
  article.find('.spec-words > [data-panel="visual-idea"]').attr('open', '');
  return $.html(article);
}

export interface FeedbackItem {
  anchor: string;
  round: number;
  text: string;
}

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

const DESIGNER = /^write-spec#(\d+)\/designer$/;

function promptOf(line: string): Prompt | undefined {
  if (line.trim() === '') return undefined;
  const event = JSON.parse(line) as { name?: unknown; t?: unknown; 'gen_ai.input.messages'?: unknown };
  const attempt = DESIGNER.exec(String(event.name ?? ''))?.[1];
  const text = event['gen_ai.input.messages'];
  if (attempt === undefined || typeof text !== 'string') return undefined;
  return { attempt: Number(attempt), t: String(event.t ?? ''), text };
}

export function designerPrompts(events: string): Prompt[] {
  const prompts = new Map<string, Prompt>();
  for (const prompt of events.split('\n').map(promptOf)) {
    if (prompt !== undefined && !prompts.has(prompt.text)) prompts.set(prompt.text, prompt);
  }
  return [...prompts.values()].sort((a, b) => b.attempt - a.attempt || b.t.localeCompare(a.t));
}

export function namesSlide(prompt: string, slide: SlidePage): boolean {
  const named = [slide.slug, slide.section].some((slug) => slug !== undefined && prompt.includes(`\`${slug}\``));
  const option = slide.optionIds.some((id) => new RegExp(`\\b${id}\\b`).test(prompt));
  return named || option || (slide.section === undefined && prompt.includes('Title slide'));
}

const PAGE_IMAGE = /reference\/([\w.-]+)\/pages\/(page-\d+\.(?:jpg|jpeg|png|webp))/g;
const REFERENCE_PAGE = /reference\/([\w.-]+)\/design-reference\.md#page-(\d+)/g;

export function citedImages(html: string): string[] {
  const images = new Set<string>();
  for (const [, deck, file] of html.matchAll(PAGE_IMAGE)) images.add(`reference/${deck}/pages/${file}`);
  for (const [, deck, page] of html.matchAll(REFERENCE_PAGE)) {
    images.add(`reference/${deck}/pages/page-${(page ?? '').padStart(2, '0')}.jpg`);
  }
  return [...images].sort();
}
