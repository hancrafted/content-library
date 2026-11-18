import { existsSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createVitest } from 'vitest/node';
import { pageFolders } from '../../src/episodes/lib/episode-folders.ts';
import type { instanceTrailOf } from '../../src/episodes/lib/episode-instance.ts';
import type { EPISODES } from '../../src/episodes/lib/episode-registry.generated.ts';
import type { PIN_LOCK_FILE as LockFile, pinsOf } from '../../src/episodes/lib/override-pins.pure.ts';
import { formatAsRepo } from '../../src/episodes/lib/oxfmt-format.ts';
import type { SiteLoader } from './registry.ts';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export async function pinOverrides(root: string, id: string, load: SiteLoader): Promise<string> {
  const folder = pageFolders(root).find((page) => page.id === id);
  if (folder === undefined) throw new Error(`No Episode folder has the id "${id}"`);
  const { EPISODES: episodes } = await load<{ EPISODES: typeof EPISODES }>(
    'src/episodes/lib/episode-registry.generated.ts',
  );
  const { instanceTrailOf: trailOf } = await load<{ instanceTrailOf: typeof instanceTrailOf }>(
    'src/episodes/lib/episode-instance.ts',
  );
  const { pinsOf: pin, PIN_LOCK_FILE: file } = await load<{ pinsOf: typeof pinsOf; PIN_LOCK_FILE: typeof LockFile }>(
    'src/episodes/lib/override-pins.pure.ts',
  );
  const record = (episodes as Readonly<Record<string, object>>)[id];
  const trail = record === undefined ? undefined : trailOf(record as never);
  if (trail === undefined) throw new Error(`"${id}" is not an Episode instance: it has no overrides to pin`);
  const lock = pin(trail as never);
  const at = path.join(folder.dir, file);
  const rel = path.relative(root, at);
  if (Object.keys(lock).length === 0) {
    if (existsSync(at)) rmSync(at);
    return `${id} overrides no Slide text: no ${rel}`;
  }
  writeFileSync(at, await formatAsRepo(at, `${JSON.stringify(lock)}\n`));
  return `pinned ${Object.values(lock).reduce((sum, paths) => sum + Object.keys(paths).length, 0)} overridden path(s) of ${id} in ${rel}`;
}

if (import.meta.main) {
  const id = process.argv[2];
  if (id === undefined) throw new Error('Usage: npm run overrides:pin -- <episode-id>');
  const root = process.cwd();
  const vitest = await createVitest('test', { config: path.join(root, 'vitest.config.mts'), watch: false });
  try {
    console.log(await pinOverrides(root, id, (repoPath) => vitest.import(path.join(root, repoPath))));
  } finally {
    await vitest.close();
  }
}
