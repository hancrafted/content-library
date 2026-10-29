// The shell half shared by the `youtube:*` entry points: the repository root, the one way to exit with a message, and
// the command line plus language of a command that works on an Episode's Recording folder.
import path from 'node:path';
import { EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { chooseLanguage, parseCommandArgs, type CommandArgs } from './command-args.pure.ts';
import { loadEpisodeEntries } from './episode-index.ts';
import { resolveEpisode, type EpisodeEntry } from './episode-resolver.pure.ts';
import { readRecordingFolder } from './recording-disk.ts';
import type { SpokenLanguage } from './transcript.pure.ts';

/** The repository root, whichever worktree the tool runs in. */
export const REPO_ROOT = path.resolve(import.meta.dirname, '../..');

export function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

/** The command line of an entry point, parsed; exits with `usage` when it is none. */
export function commandArgs(usage: string): CommandArgs {
  const parsed = parseCommandArgs(process.argv.slice(2));
  if (!parsed.ok) fail(`${parsed.reason}\nusage: ${usage}`);
  return parsed.args;
}

/** The Episode `input` names and its folder; exits when it names none. */
export async function resolvedEpisode(input: string): Promise<{ episode: EpisodeEntry; dir: string }> {
  const resolution = resolveEpisode(input, await loadEpisodeEntries(REPO_ROOT));
  if (!resolution.ok) fail(resolution.reason);
  return { episode: resolution.episode, dir: path.join(REPO_ROOT, EPISODES_DIR, resolution.episode.folder) };
}

/** The language to work in: `--lang`, else the one the Recording folder at `dir` holds; exits when none or several. */
export function recordingLanguage(requested: SpokenLanguage | undefined, dir: string): SpokenLanguage {
  const chosen = chooseLanguage(requested, Object.keys(readRecordingFolder(dir)));
  if (!chosen.ok) fail(chosen.reason);
  return chosen.language;
}
