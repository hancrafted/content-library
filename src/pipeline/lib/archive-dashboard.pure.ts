// The Design archive's dashboard, `design-archive/index.html`: every archived Episode as a card under the totals, each
// read back from its own page so the dashboard needs nothing but the pages on disk.

import { load } from 'cheerio';
import { escapeHtml, htmlPage } from './archive-html.pure.ts';

export interface ArchivedEpisode {
  slug: string;
  title: string;
  /** Slides on the Episode's page, the Title slide counted. */
  slides: number;
  options: number;
  /** The picked Option ids, in Slide order. */
  picked: string[];
}

/** What the dashboard shows of an archived Episode, read back from its page. */
export function archivedEpisode(slug: string, page: string): ArchivedEpisode {
  const $ = load(page);
  return {
    slug,
    title: $('h1').first().text().trim(),
    slides: $('[data-archive-slide]').length,
    options: $('figure[data-spec="option"]').length,
    picked: $('figure[data-spec="option"][data-picked]')
      .map((_, figure) => $(figure).attr('data-option') ?? '')
      .get(),
  };
}

function episodeCard({ slug, title, slides, options, picked }: ArchivedEpisode): string {
  const chips = picked.map((id) => `<li>${escapeHtml(id)}</li>`).join('');
  return `<li class="episode"><a href="${slug}/index.html">
<h2>${escapeHtml(title)}</h2>
<span class="slug">${escapeHtml(slug)}</span>
<p class="counts">${slides} Slides · ${options} Options</p>
<ul class="picked" aria-label="Picked Options">${chips}</ul>
</a></li>`;
}

/**
 * `design-archive/index.html`: the dashboard of every archived Episode, totals first, Episodes sorted by slug. `style`
 * is its look, the skill's `archive-dashboard.css`.
 */
export function archiveIndex(episodes: readonly ArchivedEpisode[], style: string): string {
  const sorted = [...episodes].sort((a, b) => a.slug.localeCompare(b.slug));
  const total = (key: 'slides' | 'options') => sorted.reduce((sum, episode) => sum + episode[key], 0);
  const stats = [
    [sorted.length, 'Episodes'],
    [total('slides'), 'Slides'],
    [total('options'), 'Options'],
  ]
    .map(([value, label]) => `<li data-stat="${String(label).toLowerCase()}"><b>${value}</b><span>${label}</span></li>`)
    .join('');
  const list =
    sorted.length === 0
      ? '<p class="empty">Nothing is archived yet. Promotion files an Episode here.</p>'
      : `<ul class="episodes">${sorted.map(episodeCard).join('\n')}</ul>`;
  const body = `<main class="wrap">
<p class="kicker">Content library</p>
<h1>Design archive</h1>
<p class="lede">Every promoted Episode's design Options, each Slide with the one picked and the feedback that chose it.</p>
<ul class="stats">${stats}</ul>
${list}
</main>`;
  return htmlPage({ title: 'Design archive', head: `<style>\n${style}</style>` }, body);
}
