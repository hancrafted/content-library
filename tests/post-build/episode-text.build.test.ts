// #51 post-build check: every exported Episode page, in every locale, shows the
// reader exactly the text it showed before the Self-contained Slides move, with
// no Translation key left raw. A published Episode renders under exactly the
// anchors `published-anchors.json` lists; an Upcoming one has no bound anchors
// yet, so it renders under exactly the anchors its record's Sections derive.
// The expected text is a fixture file per page under `episode-text/`, captured
// once from the build before anything moved; a page without one gets it written
// and fails, so the capture is reviewed and committed, never silently accepted.

import { load } from 'cheerio';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';
import { episodeStatus } from '../../src/components/episodes/episode-repository';
import { findEpisode } from '../../src/components/episodes/registry';
import { placeSections, type SlideOutline } from '../../src/lib/episode.pure';
import { LOCALES, localizePath } from '../../src/lib/locale.pure';
import { EPISODE_SLUGS, episodeRoute } from '../../src/lib/routes';
import { episodeText, type EpisodeText } from './episode-text';
import { exportedFile, OUT_DIR } from './exported-pages';

const PAGES = EPISODE_SLUGS.flatMap((slug) =>
  LOCALES.map((locale) => ({ slug, locale, url: localizePath(episodeRoute(slug), locale) })),
);
const PUBLISHED_PAGES = PAGES.filter(({ slug }) => episodeStatus(slug) === 'published');
const UPCOMING_PAGES = PAGES.filter(({ slug }) => episodeStatus(slug) === 'upcoming');

const FIXTURE_DIR = join(import.meta.dirname, 'episode-text');
const EPISODES_DIR = join(import.meta.dirname, '..', '..', 'src', 'components', 'episodes');

/** A dotted Translation key path as next-intl prints a message it cannot find. */
const RAW_KEY = /\b(?:episodes|landing|contextDrawer|tableOfContents|talkPlayer)\.[a-z0-9-]+\.[A-Za-z0-9.-]+/;

function builtText(url: string): EpisodeText {
  return episodeText(load(readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8')));
}

/** The captured text of one page; writes a missing capture and throws so it is reviewed before it counts. */
async function capturedText(file: string, built: EpisodeText): Promise<EpisodeText> {
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')) as EpisodeText;
  mkdirSync(FIXTURE_DIR, { recursive: true });
  const options = await resolveConfig(file);
  writeFileSync(file, await format(JSON.stringify(built), { ...options, filepath: file }));
  throw new Error(`No captured text at ${file}: written from this build. Review it, commit it, and run again.`);
}

/** The Slide anchors of an exported page, the Title slide's `top` left out, sorted. */
function builtAnchors(url: string): string[] {
  return builtText(url)
    .slides.map(({ id }) => id)
    .filter((id) => id !== 'top')
    .sort();
}

function allText(text: EpisodeText): string[] {
  return [
    text.title,
    text.description,
    text.toc,
    ...[...text.slides, ...text.notes, ...text.script].map((r) => r.text),
  ];
}

describe.each(PAGES)('$url', ({ slug, locale, url }) => {
  it('shows the reader the same text it showed before the move', async () => {
    // ARRANGE
    const built = builtText(url);
    const expected = await capturedText(join(FIXTURE_DIR, `${slug}.${locale}.json`), built);
    // ACT
    const actual = built;
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('leaves no Translation key unresolved', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const raw = allText(builtText(url)).filter((text) => RAW_KEY.test(text));
    // ASSERT
    expect(raw).toEqual(expected);
  });
});

describe.each(PUBLISHED_PAGES)('$url, published', ({ slug, url }) => {
  it('renders its Slides under exactly the published anchors', () => {
    // ARRANGE
    const published = JSON.parse(readFileSync(join(EPISODES_DIR, slug, 'published-anchors.json'), 'utf8')) as string[];
    const expected = [...published].sort();
    // ACT
    const anchors = builtAnchors(url);
    // ASSERT
    expect(anchors).toEqual(expected);
  });
});

describe.each(UPCOMING_PAGES)('$url, upcoming', ({ slug, url }) => {
  it('renders its Slides under exactly the anchors its record derives, none of them bound yet', () => {
    // ARRANGE
    const expected = placeSections<SlideOutline>(findEpisode(slug).sections)
      .flatMap((section) => section.map(({ id }) => id))
      .sort();
    const snapshot = join(EPISODES_DIR, slug, 'published-anchors.json');
    // ACT
    const anchors = builtAnchors(url);
    const bound = existsSync(snapshot);
    // ASSERT
    expect(anchors).toEqual(expected);
    expect(bound).toBe(false);
  });

  it('keeps itself out of search until it is published', () => {
    // ARRANGE
    const expected = 'noindex';
    // ACT
    const robots = load(readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8'))('head > meta[name="robots"]').attr(
      'content',
    );
    // ASSERT
    expect(robots).toContain(expected);
  });
});
