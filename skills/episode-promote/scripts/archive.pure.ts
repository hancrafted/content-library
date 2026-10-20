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
  return `<section data-archive="${name}"><h2>${heading}</h2>${items.join('\n')}</section>`;
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

/** The archive's own layout and marks; the Options' look comes from the Spec's styles and `design.css`. */
const ARCHIVE_STYLE = `
body { max-width: 1520px; margin: 0 auto; padding: 2rem; display: grid; gap: 2rem; }
figure[data-spec="option"] { position: relative; margin: 0; }
figure[data-picked]::before, figure[data-recommended]::after { position: absolute; top: -1.6rem; font: 600 0.8rem sans-serif; }
figure[data-picked]::before { content: "picked"; left: 0; color: #15803d; }
figure[data-recommended]::after { content: "recommended"; right: 0; color: #6b7280; }
[data-archive="references"] img { max-width: 480px; border: 1px solid #ddd; }
[data-archive="prompt"] pre { white-space: pre-wrap; }
`;

interface Head {
  title: string;
  /** The Spec's own `<style>` blocks, which its Option markup leans on. */
  styles?: string;
  /** Whether the Episode's compiled `design.css` sits beside the page. */
  designCss?: boolean;
}

function htmlPage({ title, styles = '', designCss = false }: Head, body: string): string {
  const link = designCss ? '<link rel="stylesheet" href="design.css" />\n' : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title>
${styles}<style>${ARCHIVE_STYLE}</style>
${link}</head>
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
function slideArchivePage(slide: SlidePage, context: EpisodeContext): { html: string; images: string[] } {
  const spec = [slide.visualIdea, ...slide.options]
    .join('\n')
    .replaceAll(`${context.staging}/reference/`, 'reference/');
  const images = citedImages(spec);
  const anchor = slide.section === undefined ? slide.slug : `${slide.section}--${slide.slug}`;
  const body = [
    `<nav><a href="index.html">${escape(context.title)}</a></nav>`,
    `<h1>${escape(slide.title)}</h1>`,
    spec,
    referenceList(images),
    feedbackList(context.feedback.filter((item) => item.anchor === anchor)),
    promptList(context.prompts.filter(({ text }) => namesSlide(text, slide))),
  ].filter((part) => part !== '');
  return { html: htmlPage({ title: slide.title, styles: context.styles, designCss: true }, body.join('\n')), images };
}

/** The Episode's own index: its Slides in Spec order, each with its picked Option. */
function episodeIndex(slides: readonly SlidePage[], { title, styles }: EpisodeContext): string {
  const items = slides.map(
    (slide) =>
      `<li><a href="${slide.slug}.html">${escape(slide.title)}${slide.picked ? ` · picked ${slide.picked}` : ''}</a></li>`,
  );
  const body = `<nav><a href="../index.html">Design archive</a></nav>\n<h1>${escape(title)}</h1>\n<ol>${items.join('\n')}</ol>`;
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
    const { html, images } = slideArchivePage(slide, context);
    pages[`${episode}/${slide.slug}.html`] = html;
    for (const image of images) references.add(image);
  }
  return { slug: episode, pages, references: [...references].sort() };
}
