import { describe, expect, it } from 'vitest';
import { episodeRegistryFiles, REGISTRY_PATHS, type EpisodeFolder } from './episode-registry.pure.ts';

const WITH_PAGE: EpisodeFolder = {
  slug: 'ai-token-economy',
  files: ['episode-metadata.ts', 'episode.ts', 'i18n', 'slides'],
  episodeSource:
    "import { episode } from '@/components/slide-master/slide';\n\nexport const aiTokenEconomy = episode({\n",
};
const COPY: EpisodeFolder = {
  slug: 'axel-ai-token-economy',
  files: ['episode-metadata.ts', 'episode.ts', 'i18n', 'slides'],
  // A `cp -r` copy whose export kept its source's name.
  episodeSource: 'export const aiTokenEconomy = episode({\n',
};
const UPCOMING: EpisodeFolder = { slug: 'specs-an-agent-can-follow', files: ['episode-metadata.ts'] };
const TOOLING: EpisodeFolder = {
  slug: 'workshop-template',
  files: ['episode.ts', 'i18n', 'slides'],
  episodeSource: 'export const workshopTemplate = episode({\n',
};

/** The text of one generated file. */
function fileAt(folders: readonly EpisodeFolder[], path: string): string {
  return episodeRegistryFiles(folders).find((file) => file.path === path)?.text ?? '';
}

describe('success cases', () => {
  it('writes one registry file per tier: the slugs for lib, the metadata for the store, the compositions for the registry', () => {
    // ARRANGE
    const expected = [REGISTRY_PATHS.slugs, REGISTRY_PATHS.metadata, REGISTRY_PATHS.compositions];
    // ACT
    const paths = episodeRegistryFiles([WITH_PAGE]).map((file) => file.path);
    // ASSERT
    expect(paths).toEqual(expected);
  });

  it('lists every Episode folder holding a record and metadata as an Episode slug, in folder-name order', () => {
    // ARRANGE
    const expected = "export const EPISODE_SLUGS = ['ai-token-economy', 'axel-ai-token-economy'] as const;";
    // ACT
    const slugs = fileAt([COPY, WITH_PAGE], REGISTRY_PATHS.slugs);
    // ASSERT
    expect(slugs).toContain(expected);
  });

  it("imports each Episode's metadata into the store's registry, keyed by its folder", () => {
    // ARRANGE
    const expected = [
      "import { episodeMetadata as aiTokenEconomy } from '@/components/episodes/ai-token-economy/episode-metadata';",
      "  'ai-token-economy': aiTokenEconomy,",
    ];
    // ACT
    const metadata = fileAt([WITH_PAGE], REGISTRY_PATHS.metadata);
    // ASSERT
    expected.forEach((line) => expect(metadata).toContain(line));
  });

  it("imports each Episode's record under the name its episode.ts exports, renamed after its folder when they differ", () => {
    // ARRANGE
    const expected = [
      "import { aiTokenEconomy } from './ai-token-economy/episode';",
      "import { aiTokenEconomy as axelAiTokenEconomy } from './axel-ai-token-economy/episode';",
      "  'axel-ai-token-economy': axelAiTokenEconomy,",
    ];
    // ACT
    const compositions = fileAt([WITH_PAGE, COPY], REGISTRY_PATHS.compositions);
    // ASSERT
    expected.forEach((line) => expect(compositions).toContain(line));
  });

  it('types each map against the Episode slugs, so a record whose slug is not its folder fails tsc', () => {
    // ARRANGE
    const expected = {
      metadata: '} as const satisfies { readonly [S in EpisodeSlug]: EpisodeInput & { readonly slug: S } };',
      compositions:
        'export const EPISODES: { readonly [S in EpisodeSlug]: EpisodeComposition & { readonly slug: S } } = {',
    };
    // ACT
    const seen = {
      metadata: fileAt([WITH_PAGE], REGISTRY_PATHS.metadata),
      compositions: fileAt([WITH_PAGE], REGISTRY_PATHS.compositions),
    };
    // ASSERT
    expect(seen.metadata).toContain(expected.metadata);
    expect(seen.compositions).toContain(expected.compositions);
  });
});

describe('failure cases', () => {
  it('refuses an Episode folder whose episode.ts exports no record, naming the folder', () => {
    // ARRANGE
    const broken: EpisodeFolder = { ...WITH_PAGE, episodeSource: 'export const notes = [];\n' };
    // ACT
    const generate = () => episodeRegistryFiles([broken]);
    // ASSERT
    expect(generate).toThrow(/ai-token-economy\/episode\.ts/);
  });

  it('refuses an Episode folder whose episode.ts exports two records', () => {
    // ARRANGE
    const twice: EpisodeFolder = {
      ...WITH_PAGE,
      episodeSource: `${WITH_PAGE.episodeSource}export const b = episode({\n`,
    };
    // ACT
    const generate = () => episodeRegistryFiles([twice]);
    // ASSERT
    expect(generate).toThrow(/ai-token-economy\/episode\.ts/);
  });
});

describe('edge cases', () => {
  it('leaves a folder without metadata out of every registry file: a tooling page is no Episode', () => {
    // ARRANGE
    const expected = TOOLING.slug;
    // ACT
    const texts = episodeRegistryFiles([TOOLING, WITH_PAGE]).map((file) => file.text);
    // ASSERT
    texts.forEach((text) => expect(text).not.toContain(expected));
  });

  it("lists a folder holding only its metadata as an upcoming Episode: in the store's registry, with no page", () => {
    // ARRANGE
    const expected = {
      upcoming: 'export const UPCOMING_METADATA: readonly EpisodeInput[] = [specsAnAgentCanFollow];',
      slugs: 'export const EPISODE_SLUGS = [] as const;',
    };
    // ACT
    const seen = {
      metadata: fileAt([UPCOMING], REGISTRY_PATHS.metadata),
      slugs: fileAt([UPCOMING], REGISTRY_PATHS.slugs),
      compositions: fileAt([UPCOMING], REGISTRY_PATHS.compositions),
    };
    // ASSERT
    expect(seen.metadata).toContain(expected.upcoming);
    expect(seen.slugs).toContain(expected.slugs);
    expect(seen.compositions).not.toContain(UPCOMING.slug);
  });

  it('marks every registry file as generated, naming the command that rewrites it', () => {
    // ARRANGE
    const expected = 'npm run registry';
    // ACT
    const texts = episodeRegistryFiles([WITH_PAGE]).map((file) => file.text);
    // ASSERT
    texts.forEach((text) => expect(text).toContain(expected));
  });
});
