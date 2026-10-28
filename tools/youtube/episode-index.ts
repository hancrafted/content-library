// The disk half of the Episode resolver: lists every Episode folder with the videos its metadata declares, for
// `resolveEpisode`. Loads each `episode-metadata.ts` by a computed import (a static one is forbidden to tools by FE-007 §2).
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { episodeFolders } from '../../src/episodes/lib/episode-folders.ts';
import { videoIdsOf, type EpisodeEntry, type YoutubeMetadata } from './episode-resolver.pure.ts';

const METADATA_FILE = 'episode-metadata.ts';

/** Every Episode under `root`, standalone and Event copy, with the video IDs it declares. */
export async function loadEpisodeEntries(root: string): Promise<EpisodeEntry[]> {
  return Promise.all(
    episodeFolders(root).map(async (page) => {
      const module = (await import(pathToFileURL(path.join(page.dir, METADATA_FILE)).href)) as {
        episodeMetadata: { youtube?: YoutubeMetadata };
      };
      return {
        id: page.id,
        slug: page.slug,
        ...(page.kind === 'event-copy' ? { event: page.event } : {}),
        folder: page.folder,
        videoIds: videoIdsOf(module.episodeMetadata.youtube),
      };
    }),
  );
}
