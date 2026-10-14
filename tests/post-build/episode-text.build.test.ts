// #51 post-build check: every exported Episode page, in every locale, shows the
// reader exactly the text it showed before the Self-contained Slides move, under
// the anchors `published-anchors.json` lists, with no Translation key left raw.
// The expected text is a fixture file per page under `episode-text/`, captured
// once from the build before anything moved; a page without one gets it written
// and fails, so the capture is reviewed and committed, never silently accepted.

import { load } from 'cheerio';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/lib/locale.pure';
import { EPISODE_SLUGS, episodeRoute } from '../../src/lib/routes';
import { episodeText, type EpisodeText } from './episode-text';
import { exportedFile, OUT_DIR } from './exported-pages';

const PAGES = EPISODE_SLUGS.flatMap((slug) =>
  LOCALES.map((locale) => ({ slug, locale, url: localizePath(episodeRoute(slug), locale) })),
);

const FIXTURE_DIR = join(import.meta.dirname, 'episode-text');
const EPISODES_DIR = join(import.meta.dirname, '..', '..', 'src', 'components', 'episodes');

/** A dotted Translation key path as next-intl prints a message it cannot find. */
const RAW_KEY = /\b(?:episodes|landing|contextDrawer|tableOfContents|talkPlayer)\.[a-z0-9-]+\.[A-Za-z0-9.-]+/;

/**
 * An upcoming Episode's page is built `noindex` and has no `published-anchors.json` yet: its anchors bind at
 * publication (docs/features/episode-publishing.md), as `published-anchors.test.ts` skips it too.
 */
function isUpcoming(url: string): boolean {
  const $ = load(readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8'));
  return $('meta[name="robots"]').attr('content')?.includes('noindex') ?? false;
}

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

  it.skipIf(isUpcoming(url))('renders its Slides under exactly the published anchors', () => {
    // ARRANGE
    const published = JSON.parse(readFileSync(join(EPISODES_DIR, slug, 'published-anchors.json'), 'utf8')) as string[];
    const expected = [...published].sort();
    // ACT
    const anchors = builtText(url)
      .slides.map(({ id }) => id)
      .filter((id) => id !== 'top')
      .sort();
    // ASSERT
    expect(anchors).toEqual(expected);
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
