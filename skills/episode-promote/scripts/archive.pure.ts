// The Design archive (GLOSSARY.md) of one Episode, from its Staging: one page per Slide of the approved Spec with
// every Option, the picked one marked, plus the index. Pure: Staging's text in, `{ path: html }` out; the CLI
// (`archive.ts`) reads and writes the disk.

import { load } from 'cheerio';
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
}

export interface Archive {
  /** The Episode's slug, from the Spec's `<h1 id>`: its folder under `design-archive/`. */
  slug: string;
  /** Pages keyed by their path under `design-archive/`. */
  pages: Record<string, string>;
  /** The design reference images the pages cite, Staging-relative; the CLI copies each to `design-archive/<slug>/`. */
  references: string[];
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** One archive section, `data-archive="<name>"`, holding `items`; nothing when there are none. */
function archiveSection(name: string, heading: string, items: readonly string[]): string {
  if (items.length === 0) return '';
  return `<section class="spec-card" data-archive="${name}"><h4>${heading}</h4>${items.join('\n')}</section>`;
}

function feedbackList(items: readonly FeedbackItem[]): string {
  const lines = items.map(({ round, text }) => `<li>Round ${round} · ${escape(text)}</li>`);
  return archiveSection('feedback', 'Feedback', lines.length === 0 ? [] : ['<ol>', ...lines, '</ol>']);
}

function promptList(prompts: readonly Prompt[]): string {
  const items = prompts.map(
    ({ attempt, text }) =>
      `<details data-archive="prompt"><summary>Designer prompt · attempt ${attempt}</summary><pre>${escape(text)}</pre></details>`,
  );
  return archiveSection('prompts', 'Design prompts', items);
}

function referenceList(images: readonly string[]): string {
  const figures = images.map(
    (src) => `<figure><img src="${src}" alt="" loading="lazy" /><figcaption><code>${src}</code></figcaption></figure>`,
  );
  return archiveSection('references', 'Design references', figures);
}

/** The archive's own layout; a Slide page wears the Spec's frame, its look from the Spec's styles and `design.css`. */
const ARCHIVE_STYLE = `
body:not(:has(.spec-shell)) { max-width: 1520px; margin: 0 auto; padding: 2rem; }
.spec-outline .spec-outline-episode { display: block; margin-bottom: 1rem; font-weight: 600; }
.spec-outline a[aria-current="page"] { font-weight: 600; }
[data-archive] { margin-top: 2rem; }
ol.spec-card { list-style: decimal inside; line-height: 2; }
.spec-kicker a, ol.spec-card a { color: inherit; }
.spec-words > [data-panel="visual-idea"] { display: block; }
[data-archive="references"] img { max-width: 480px; border: 1px solid var(--border, #ddd); }
[data-archive="prompt"] pre { white-space: pre-wrap; }
`;

/**
 * The Spec's Option tabs, rebuilt for a page with no review form: an Option's ✓ comes from \`data-picked\`, and a
 * Slide opens on its picked Option, else its recommended one, else its first. Without the script every Option shows,
 * stacked.
 */
const ARCHIVE_SCRIPT = `
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
        const badge = document.createElement('span');
        badge.className = 'spec-badge';
        badge.textContent = 'Recommended';
        button.append(badge);
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

interface Head {
  title: string;
  /** The Spec's own `<style>` blocks, which its Option markup leans on. */
  styles?: string;
  /** Whether the Episode's compiled `design.css` sits beside the page. */
  designCss?: boolean;
  /** Whether the page carries the archive's Option tabs script. */
  tabs?: boolean;
}

function htmlPage({ title, styles = '', designCss = false, tabs = false }: Head, body: string): string {
  const link = designCss ? '<link rel="stylesheet" href="design.css" />\n' : '';
  const script = tabs ? `<script>${ARCHIVE_SCRIPT}</script>\n` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title>
${styles}<style>${ARCHIVE_STYLE}</style>
${link}${script}</head>
<body>
${body}
</body>
</html>
`;
}

export interface ArchivedEpisode {
  slug: string;
  title: string;
}

/** `design-archive/index.html`: every archived Episode, linked by its title. */
export function archiveIndex(episodes: readonly ArchivedEpisode[]): string {
  const items = [...episodes]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map(({ slug, title }) => `<li><a href="${slug}/index.html">${escape(title)}</a></li>`);
  return htmlPage({ title: 'Design archive' }, `<h1>Design archive</h1>\n<ul>${items.join('\n')}</ul>`);
}

interface EpisodeContext {
  episode: string;
  title: string;
  styles: string;
  staging: string;
  feedback: FeedbackItem[];
  prompts: Prompt[];
}

/** One Slide's archive page, and the reference images it cites. */
/** The Spec's outline as the archive's: every Slide links its own page, picked ones and the current one marked. */
function outline(slides: readonly SlidePage[], current: SlidePage | undefined, title: string): string {
  const items = slides.map((slide) => {
    const state = slide.picked ? ' data-state="picked"' : '';
    const here = slide === current ? ' aria-current="page"' : '';
    return `<li><a href="${slide.slug}.html"${state}${here}>${escape(slide.label)}</a></li>`;
  });
  return `<nav class="spec-outline" aria-label="Slides"><a class="spec-outline-episode" href="index.html">${escape(title)}</a><ol>${items.join('\n')}</ol></nav>`;
}

function slideArchivePage(
  slide: SlidePage,
  slides: readonly SlidePage[],
  context: EpisodeContext,
): { html: string; images: string[] } {
  const article = slide.article.replaceAll(`${context.staging}/reference/`, 'reference/');
  const images = citedImages(article);
  const anchor = slide.section === undefined ? slide.slug : `${slide.section}--${slide.slug}`;
  const main = [
    article,
    referenceList(images),
    feedbackList(context.feedback.filter((item) => item.anchor === anchor)),
    promptList(context.prompts.filter(({ text }) => namesSlide(text, slide))),
  ].filter((part) => part !== '');
  const body = `<div class="spec-shell">${outline(slides, slide, context.title)}<main class="spec-page">${main.join('\n')}</main></div>`;
  return { html: htmlPage({ title: slide.title, styles: context.styles, designCss: true, tabs: true }, body), images };
}

/** The Episode's own index: its Slides in Spec order, each with its picked Option. */
function episodeIndex(slides: readonly SlidePage[], { title, styles }: EpisodeContext): string {
  const items = slides.map(
    (slide) =>
      `<li><a href="${slide.slug}.html">${escape(slide.title)}${slide.picked ? ` · picked ${slide.picked}` : ''}</a></li>`,
  );
  const masthead = `<header class="spec-masthead"><p class="spec-kicker"><a href="../index.html">Design archive</a> · ${slides.length} Slides</p><h1>${escape(title)}</h1></header>`;
  const main = `${masthead}\n<ol class="spec-card">${items.join('\n')}</ol>`;
  const body = `<div class="spec-shell">${outline(slides, undefined, title)}<main class="spec-page">${main}</main></div>`;
  return htmlPage({ title, styles, designCss: true }, body);
}

export function designArchive(input: ArchiveInput): Archive {
  const $ = load(input.spec);
  const heading = $('h1[id]').first();
  const episode = heading.attr('id');
  if (!episode) throw new Error('the Spec has no <h1 id> naming its Episode slug');
  const context: EpisodeContext = {
    episode,
    title: heading.text().trim(),
    styles: $('head style')
      .toArray()
      .map((style) => $.html(style))
      .join('\n'),
    staging: input.staging,
    feedback: feedbackItems(input.feedback),
    prompts: designerPrompts(input.events),
  };
  const slides = slidePages($);
  const pages: Record<string, string> = { [`${episode}/index.html`]: episodeIndex(slides, context) };
  const references = new Set<string>();
  for (const slide of slides) {
    const { html, images } = slideArchivePage(slide, slides, context);
    pages[`${episode}/${slide.slug}.html`] = html;
    for (const image of images) references.add(image);
  }
  return { slug: episode, pages, references: [...references].sort() };
}
