// The Design archive (GLOSSARY.md) of one Episode, from its Staging: one page holding every Slide of the approved
// Spec with every Option, the picked one marked, in the Spec's own frame. The dashboard is archive-dashboard.pure.ts.
// Pure: Staging's text in, `{ path: html }` out; the CLI (`skills/episode-promote/scripts/archive.ts`) reads and writes the disk.

import { load, type CheerioAPI } from 'cheerio';
import { escapeHtml, htmlPage } from './archive-html.pure.ts';
import {
  citedImages,
  designerPrompts,
  feedbackItems,
  namesSlide,
  slidePages,
  type FeedbackItem,
  type Prompt,
  type SlidePage,
} from './archive-staging.pure.ts';

export interface ArchiveInput {
  /** The Staging folder, repo-relative, as the Spec's build notes name it: `docs/episodes/<folder>`. */
  staging: string;
  /** `spec/spec.html`. */
  spec: string;
  /** Every `feedback/NN/feedback.md`, keyed by its Staging-relative path. */
  feedback: Readonly<Record<string, string>>;
  /** `events.jsonl`. */
  events: string;
  /** The Episode page's own additions to the Spec's styles and `design.css`: the skill's `archive-episode.css`. */
  style: string;
}

export interface Archive {
  /** The Episode's slug, from the Spec's `<h1 id>`: its folder under `design-archive/`. */
  slug: string;
  /** Pages keyed by their path under `design-archive/`: the Episode's one page, `<slug>/index.html`. */
  pages: Record<string, string>;
  /** The design reference images the page cites, Staging-relative; the CLI copies each to `design-archive/<slug>/`. */
  references: string[];
}

/** One archive section, `data-archive="<name>"`, holding `items`; nothing when there are none. */
function archiveSection(name: string, heading: string, items: readonly string[]): string {
  if (items.length === 0) return '';
  return `<section class="spec-card" data-archive="${name}"><h4>${heading}</h4>${items.join('\n')}</section>`;
}

function feedbackList(items: readonly FeedbackItem[]): string {
  const lines = items.map(({ round, text }) => `<li>Round ${round} · ${escapeHtml(text)}</li>`);
  return archiveSection('feedback', 'Feedback', lines.length === 0 ? [] : ['<ol>', ...lines, '</ol>']);
}

function promptList(prompts: readonly Prompt[]): string {
  const items = prompts.map(
    ({ attempt, text }) =>
      `<details data-archive="prompt"><summary>Designer prompt · attempt ${attempt}</summary><pre>${escapeHtml(text)}</pre></details>`,
  );
  return archiveSection('prompts', 'Design prompts', items);
}

function referenceList(images: readonly string[]): string {
  const figures = images.map(
    (src) => `<figure><img src="${src}" alt="" loading="lazy" /><figcaption><code>${src}</code></figcaption></figure>`,
  );
  return archiveSection('references', 'Design references', figures);
}

/**
 * The Spec's Option tabs, rebuilt for a page with no review form: an Option's ✓ comes from \`data-picked\`, and a
 * Slide opens on its picked Option, else its recommended one, else its first. Without the script every Option shows,
 * stacked.
 */
const TABS_SCRIPT = `
addEventListener('DOMContentLoaded', () => {
  for (const options of document.querySelectorAll('.spec-options')) {
    const figures = [...options.querySelectorAll(':scope > [data-spec="option"]')];
    const tabs = document.createElement('div');
    tabs.className = 'spec-tabs';
    tabs.setAttribute('role', 'tablist');
    const show = (figure) => {
      for (const other of figures) other.toggleAttribute('data-active', other === figure);
      for (const button of tabs.children)
        button.setAttribute('aria-selected', String(button.dataset.option === figure.dataset.option));
    };
    for (const figure of figures) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.dataset.option = figure.dataset.option;
      button.textContent = 'Option ' + figure.dataset.option;
      const mark = document.createElement('span');
      mark.className = 'spec-picked';
      mark.textContent = figure.hasAttribute('data-picked') ? '✓' : '';
      button.append(mark);
      if (figure.hasAttribute('data-recommended')) {
        const flag = document.createElement('span');
        flag.className = 'spec-badge';
        flag.textContent = 'Recommended';
        button.append(flag);
      }
      button.addEventListener('click', () => show(figure));
      tabs.append(button);
    }
    options.before(tabs);
    options.classList.add('is-tabbed');
    show(
      figures.find((f) => f.hasAttribute('data-picked')) ??
        figures.find((f) => f.hasAttribute('data-recommended')) ??
        figures[0],
    );
  }
});
`;

interface EpisodeContext {
  title: string;
  staging: string;
  feedback: FeedbackItem[];
  prompts: Prompt[];
  style: string;
}

/** One Slide on the Episode page: the Spec's article, then its references, feedback and prompts. */
function slideBlock(slide: SlidePage, context: EpisodeContext): { html: string; images: string[] } {
  const article = slide.article.replaceAll(`${context.staging}/reference/`, 'reference/');
  const images = citedImages(article);
  const anchor = slide.section === undefined ? slide.slug : `${slide.section}--${slide.slug}`;
  const parts = [
    article,
    referenceList(images),
    feedbackList(context.feedback.filter((item) => item.anchor === anchor)),
    promptList(context.prompts.filter(({ text }) => namesSlide(text, slide))),
  ].filter((part) => part !== '');
  return { html: `<div data-archive-slide="${slide.slug}">${parts.join('\n')}</div>`, images };
}

interface Group {
  /** The Section's slug; none for the Title slide's group. */
  section?: string;
  title: string;
  slides: SlidePage[];
}

/** The Slides grouped as the Spec's outline groups them: the Title slide under Episode, then each Section. */
function groups($: CheerioAPI, slides: readonly SlidePage[]): Group[] {
  const result: Group[] = [];
  for (const slide of slides) {
    const last = result.at(-1);
    if (last && last.section === slide.section) {
      last.slides.push(slide);
      continue;
    }
    const title =
      slide.section === undefined
        ? 'Episode'
        : $(`section[data-spec="section"]#${slide.section} h2`).first().text().trim() || slide.section;
    result.push({ section: slide.section, title, slides: [slide] });
  }
  return result;
}

function outline(grouped: readonly Group[]): string {
  const sections = grouped.map(({ title, slides }) => {
    const links = slides.map((slide) => {
      const state = slide.picked ? ' data-state="picked"' : '';
      return `<li><a href="#${slide.slug}"${state}>${escapeHtml(slide.label)}</a></li>`;
    });
    return `<li><span class="spec-outline-section">${escapeHtml(title)}</span><ol>${links.join('')}</ol></li>`;
  });
  return `<nav class="spec-outline" aria-label="Slides"><ol>${sections.join('\n')}</ol></nav>`;
}

interface EpisodePage {
  html: string;
  references: string[];
}

/** The Episode's one page: the masthead, then each group's Slides, the Spec's styles and the tabs script in the head. */
function episodePage($: CheerioAPI, slides: readonly SlidePage[], context: EpisodeContext): EpisodePage {
  const references = new Set<string>();
  const grouped = groups($, slides);
  const sections = grouped.map((group) => {
    const blocks = group.slides.map((slide) => {
      const { html, images } = slideBlock(slide, context);
      for (const image of images) references.add(image);
      return html;
    });
    if (group.section === undefined) return blocks.join('\n');
    return `<section data-spec="section" id="${group.section}"><h2 class="archive-section-title">${escapeHtml(group.title)}</h2>\n${blocks.join('\n')}</section>`;
  });
  const masthead = `<header class="spec-masthead"><p class="spec-kicker"><a href="../index.html">Design archive</a> · ${slides.length} Slides</p><h1>${escapeHtml(context.title)}</h1></header>`;
  const body = `<div class="spec-shell">${outline(grouped)}<main class="spec-page">${masthead}\n${sections.join('\n')}</main></div>`;
  const specStyles = $('head style')
    .toArray()
    .map((style) => $.html(style))
    .join('\n');
  const head = `${specStyles}\n<style>${context.style}</style>\n<link rel="stylesheet" href="design.css" />\n<script>${TABS_SCRIPT}</script>`;
  return { html: htmlPage({ title: context.title, head }, body), references: [...references].sort() };
}

export function designArchive(input: ArchiveInput): Archive {
  const $ = load(input.spec);
  const heading = $('h1[id]').first();
  const episode = heading.attr('id');
  if (!episode) throw new Error('the Spec has no <h1 id> naming its Episode slug');
  const { html, references } = episodePage($, slidePages($), {
    title: heading.text().trim(),
    staging: input.staging,
    feedback: feedbackItems(input.feedback),
    prompts: designerPrompts(input.events),
    style: input.style,
  });
  return { slug: episode, pages: { [`${episode}/index.html`]: html }, references };
}
