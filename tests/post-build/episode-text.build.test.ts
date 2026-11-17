// decision: FE-002 §5.2
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatAsRepo } from '../../src/episodes/lib/oxfmt-format.ts';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { episodeText, type EpisodeText } from './episode-text';
import { EXPORTED_EPISODE_SHAPED_PAGES, exportedPage } from './exported-pages';

const PAGES = EXPORTED_EPISODE_SHAPED_PAGES.flatMap(({ slug, route, folder, isNotEpisode }) =>
  LOCALES.map((locale) => ({ slug, folder, isNotEpisode, locale, url: localizePath(route, locale) })),
);

const FIXTURE_DIR = join(import.meta.dirname, 'episode-text');
const EPISODES_DIR = join(import.meta.dirname, '..', '..', 'src', 'episodes');

const RAW_KEY = /\b(?:episodes|landing|contextDrawer|tableOfContents|talkPlayer)\.[a-z0-9-]+\.[A-Za-z0-9.-]+/;

function builtText(url: string): EpisodeText {
  return episodeText(exportedPage(url));
}

function isNoindex(url: string): boolean {
  const page = exportedPage(url);
  return (page('meta[name="robots"]').attr('content') ?? '').includes('noindex');
}

async function capturedText(file: string, built: EpisodeText): Promise<EpisodeText> {
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')) as EpisodeText;
  mkdirSync(FIXTURE_DIR, { recursive: true });
  writeFileSync(file, await formatAsRepo(file, JSON.stringify(built)));
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

describe.each(PAGES)('$url', ({ slug, folder, isNotEpisode, locale, url }) => {
  it('shows the reader the same text it showed before the move', async () => {
    // ARRANGE
    const built = builtText(url);
    const expected = await capturedText(join(FIXTURE_DIR, `${slug}.${locale}.json`), built);
    // ACT
    const actual = built;
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('renders its Slides under exactly the published anchors, or binds none while upcoming and noindex, a Template always bound', () => {
    // ARRANGE
    const file = join(EPISODES_DIR, folder, 'published-anchors.json');
    // spec: docs/features/episode-publishing.md#steps
    if (isNoindex(url) && !isNotEpisode) {
      expect(existsSync(file)).toBe(false);
      return;
    }
    const published = JSON.parse(readFileSync(file, 'utf8')) as string[];
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
