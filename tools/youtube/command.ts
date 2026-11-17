import path from 'node:path';
import { EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { chooseLanguage, parseCommandArgs, type CommandArgs } from './command-args.pure.ts';
import { loadEpisodeEntries } from './episode-index.ts';
import { resolveEpisode, type EpisodeEntry } from './episode-resolver.pure.ts';
import { readRecordingFolder } from './recording-disk.ts';
import type { SpokenLanguage } from './transcript.pure.ts';

export const REPO_ROOT = path.resolve(import.meta.dirname, '../..');

export function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

export function commandArgs(usage: string): CommandArgs {
  const parsed = parseCommandArgs(process.argv.slice(2));
  if (!parsed.ok) fail(`${parsed.reason}\nusage: ${usage}`);
  return parsed.args;
}

export async function resolvedEpisode(input: string): Promise<{ episode: EpisodeEntry; dir: string }> {
  const resolution = resolveEpisode(input, await loadEpisodeEntries(REPO_ROOT));
  if (!resolution.ok) fail(resolution.reason);
  return { episode: resolution.episode, dir: path.join(REPO_ROOT, EPISODES_DIR, resolution.episode.folder) };
}

export function recordingLanguage(requested: SpokenLanguage | undefined, dir: string): SpokenLanguage {
  const chosen = chooseLanguage(requested, Object.keys(readRecordingFolder(dir)));
  if (!chosen.ok) fail(chosen.reason);
  return chosen.language;
}
