import { describe, expect, it } from 'vitest';
import { episodeRef } from '../../src/episodes/lib/episode-folders.ts';
import { episodeRegistryFiles, REGISTRY_PATHS, type EpisodeFolder } from './episode-registry.pure.ts';

const WITH_PAGE: EpisodeFolder = {
  id: 'ai-token-economy',
  folder: 'ai-token-economy',
  files: ['episode-metadata.ts', 'episode.ts', 'i18n', 'slides'],
  episodeSource:
    "import { episode } from '@/episodes/components/slide-master/slide';\n\nexport const aiTokenEconomy = episode({\n",
};
/** The id the registry keys an Event's copy by, as its folder `by-event/2026-10-23-axel/ai-token-economy/` gives it. */
const COPY_ID = episodeRef('ai-token-economy', '2026-10-23-axel').id;
const COPY: EpisodeFolder = {
  id: COPY_ID,
  folder: 'by-event/2026-10-23-axel/ai-token-economy',
  files: ['episode-metadata.ts', 'episode.ts', 'i18n', 'slides'],
  // An Event's `cp -r` copy, under its Event, whose export kept its source's name.
  episodeSource: 'export const aiTokenEconomy = episode({\n',
};
const UPCOMING: EpisodeFolder = {
  id: 'specs-an-agent-can-follow',
  folder: 'specs-an-agent-can-follow',
  files: ['episode-metadata.ts'],
};
const TEMPLATE: EpisodeFolder = {
  id: 'workshop-template',
  folder: 'templates/workshop-template',
  files: ['episode.ts', 'i18n', 'slides'],
  episodeSource: 'export const workshopTemplate = episode({\n',
};

const GUIDE: EpisodeFolder = {
  id: 'get-workshop-ready',
  folder: 'guides/get-workshop-ready',
  files: ['episode.ts', 'i18n', 'slides'],
  episodeSource: 'export const getWorkshopReady = episode({\n',
};

/** The text of one generated file. */
function fileAt(folders: readonly EpisodeFolder[], path: string): string {
  return episodeRegistryFiles(folders).find((file) => file.path === path)?.text ?? '';
}

describe('success cases', () => {
  it('writes one registry file per tier: the ids for lib, the metadata for the store, the compositions for the registry', () => {
    // ARRANGE
    const expected = [REGISTRY_PATHS.ids, REGISTRY_PATHS.metadata, REGISTRY_PATHS.compositions];
    // ACT
    const paths = episodeRegistryFiles([WITH_PAGE]).map((file) => file.path);
    // ASSERT
    expect(paths).toEqual(expected);
  });

  it('lists every Episode folder holding a record and metadata by its Episode id, in id order', () => {
    // ARRANGE
    const expected = `export const EPISODE_IDS = ['${COPY_ID}', 'ai-token-economy'] as const;`;
    // ACT
    const slugs = fileAt([COPY, WITH_PAGE], REGISTRY_PATHS.ids);
    // ASSERT
    expect(slugs).toContain(expected);
  });

  it("imports each Episode's metadata into the store's registry from its folder, keyed by its id", () => {
    // ARRANGE
    const expected = [
      "import { episodeMetadata as aiTokenEconomy } from '@/episodes/ai-token-economy/episode-metadata';",
      "import { episodeMetadata as _20261023Axel__aiTokenEconomy } from '@/episodes/by-event/2026-10-23-axel/ai-token-economy/episode-metadata';",
      "  'ai-token-economy': aiTokenEconomy,",
      `  '${COPY_ID}': _20261023Axel__aiTokenEconomy,`,
    ];
    // ACT
    const metadata = fileAt([WITH_PAGE, COPY], REGISTRY_PATHS.metadata);
    // ASSERT
    expected.forEach((line) => expect(metadata).toContain(line));
  });

  it("imports each Episode's record under the name its episode.ts exports, renamed after its folder when they differ", () => {
    // ARRANGE
    const expected = [
      "import { aiTokenEconomy } from '@/episodes/ai-token-economy/episode';",
      "import { aiTokenEconomy as _20261023Axel__aiTokenEconomy } from '@/episodes/by-event/2026-10-23-axel/ai-token-economy/episode';",
      `  '${COPY_ID}': _20261023Axel__aiTokenEconomy,`,
    ];
    // ACT
    const compositions = fileAt([WITH_PAGE, COPY], REGISTRY_PATHS.compositions);
    // ASSERT
    expected.forEach((line) => expect(compositions).toContain(line));
  });

  it("types each map against the Episode ids, so a record whose slug is not its folder's name fails tsc", () => {
    // ARRANGE
    const expected = {
      metadata:
        '} as const satisfies { readonly [I in EpisodeId]: EpisodeInput & { readonly slug: EpisodeSlugOf<I> } };',
      compositions:
        'export const EPISODES: { readonly [I in EpisodeId]: EpisodeComposition & { readonly slug: EpisodeSlugOf<I> } } = {',
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

  it('lists each Template by its slug beside the Episode ids, so routes need no hand-written list', () => {
    // ARRANGE
    const expected = "export const TEMPLATE_SLUGS = ['workshop-template'] as const;";
    // ACT
    const ids = fileAt([TEMPLATE, WITH_PAGE], REGISTRY_PATHS.ids);
    // ASSERT
    expect(ids).toContain(expected);
  });

  it('composes each Template from its folder under templates/, keyed by its slug and typed against it', () => {
    // ARRANGE
    const expected = [
      "import { workshopTemplate } from '@/episodes/templates/workshop-template/episode';",
      'export const TEMPLATE_PAGES: { readonly [S in TemplateSlug]: EpisodeComposition & { readonly slug: S } } = {',
      "  'workshop-template': workshopTemplate,",
    ];
    // ACT
    const compositions = fileAt([TEMPLATE, WITH_PAGE], REGISTRY_PATHS.compositions);
    // ASSERT
    expected.forEach((line) => expect(compositions).toContain(line));
  });

  it('lists each Guide by its slug and composes it from its folder under guides/, never as an Episode', () => {
    // ARRANGE
    const expected = [
      "export const GUIDE_SLUGS = ['get-workshop-ready'] as const;",
      "import { getWorkshopReady } from '@/episodes/guides/get-workshop-ready/episode';",
      'export const GUIDES: { readonly [S in GuideSlug]: EpisodeComposition & { readonly slug: S } } = {',
      "  'get-workshop-ready': getWorkshopReady,",
    ];
    // ACT
    const ids = fileAt([GUIDE, WITH_PAGE], REGISTRY_PATHS.ids);
    const compositions = fileAt([GUIDE, WITH_PAGE], REGISTRY_PATHS.compositions);
    const episodeIds = ids.slice(ids.indexOf('EPISODE_IDS'), ids.indexOf('TEMPLATE_SLUGS'));
    // ASSERT
    expected.forEach((line) => expect(`${ids}${compositions}`).toContain(line));
    expect(episodeIds).not.toContain('get-workshop-ready');
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

  it("refuses an Event copy's broken episode.ts naming its folder under its Event", () => {
    // ARRANGE
    const broken: EpisodeFolder = { ...COPY, episodeSource: 'export const notes = [];\n' };
    // ACT
    const generate = () => episodeRegistryFiles([broken]);
    // ASSERT
    expect(generate).toThrow(/by-event\/2026-10-23-axel\/ai-token-economy\/episode\.ts/);
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
  it("leaves a Template out of the Episode ids and the store's metadata: a Template is no Episode", () => {
    // ARRANGE
    const expected = "export const EPISODE_IDS = ['ai-token-economy'] as const;";
    // ACT
    const ids = fileAt([TEMPLATE, WITH_PAGE], REGISTRY_PATHS.ids);
    const metadata = fileAt([TEMPLATE, WITH_PAGE], REGISTRY_PATHS.metadata);
    // ASSERT
    expect(ids).toContain(expected);
    expect(metadata).not.toContain(TEMPLATE.id);
  });

  it('refuses a Template whose episode.ts exports no record, naming its folder under templates/', () => {
    // ARRANGE
    const broken: EpisodeFolder = { ...TEMPLATE, episodeSource: 'export const notes = [];\n' };
    // ACT
    const generate = () => episodeRegistryFiles([broken]);
    // ASSERT
    expect(generate).toThrow(/templates\/workshop-template\/episode\.ts/);
  });

  it("lists a folder holding only its metadata as an upcoming Episode: in the store's registry, with no page", () => {
    // ARRANGE
    const expected = {
      upcoming:
        "export const UPCOMING_METADATA: Readonly<Record<string, EpisodeInput>> = { 'specs-an-agent-can-follow': specsAnAgentCanFollow };",
      slugs: 'export const EPISODE_IDS = [] as const;',
    };
    // ACT
    const seen = {
      metadata: fileAt([UPCOMING], REGISTRY_PATHS.metadata),
      slugs: fileAt([UPCOMING], REGISTRY_PATHS.ids),
      compositions: fileAt([UPCOMING], REGISTRY_PATHS.compositions),
    };
    // ASSERT
    expect(seen.metadata).toContain(expected.upcoming);
    expect(seen.slugs).toContain(expected.slugs);
    expect(seen.compositions).not.toContain(UPCOMING.id);
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
