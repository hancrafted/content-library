// The pure half of every `youtube:*` entry point's command line: `<input> [--lang en|de] [--dry-run] [--force]`, and which spoken
// language a Recording folder holds. The shell (`command.ts`) reads the folder and exits.
import { parseSpokenLanguage, SPOKEN_LANGUAGES, type SpokenLanguage } from './transcript.pure.ts';

export interface CommandArgs {
  /** The Episode folder, page URL or video ID. */
  readonly input: string;
  /** The language passed with `--lang`; undefined when the Recording folder decides. */
  readonly language?: SpokenLanguage;
  readonly dryRun: boolean;
  /** `--force`: `youtube:apply` overwrites a description edited on YouTube since its last apply. */
  readonly force: boolean;
}

function langProblem(argv: readonly string[]): string | undefined {
  const at = argv.indexOf('--lang');
  if (at === -1 || parseSpokenLanguage(argv[at + 1] ?? '') !== undefined) return undefined;
  return `--lang takes ${SPOKEN_LANGUAGES.join(' or ')}, got "${argv[at + 1] ?? ''}"`;
}

/** The command line's input, `--lang` and `--dry-run`, or why it is none. */
export function parseCommandArgs(
  argv: readonly string[],
): { ok: true; args: CommandArgs } | { ok: false; reason: string } {
  const problem = langProblem(argv);
  if (problem !== undefined) return { ok: false, reason: problem };
  const langAt = argv.indexOf('--lang');
  const language = langAt === -1 ? undefined : parseSpokenLanguage(argv[langAt + 1] ?? '');
  const input = argv.find((arg, index) => !arg.startsWith('--') && (langAt === -1 || index !== langAt + 1));
  if (input === undefined) return { ok: false, reason: 'no Episode folder, page URL or video ID given' };
  return {
    ok: true,
    args: {
      input,
      ...(language === undefined ? {} : { language }),
      dryRun: argv.includes('--dry-run'),
      force: argv.includes('--force'),
    },
  };
}

const LANGUAGE_FILE = /\.([a-z]{2})\.(?:json|vtt|md)$/;

/** The spoken languages the files of a Recording folder carry in their names (`transcript.de.vtt`), in a fixed order. */
export function recordingLanguages(fileNames: readonly string[]): SpokenLanguage[] {
  const found = new Set(fileNames.map((name) => LANGUAGE_FILE.exec(name)?.[1]));
  return SPOKEN_LANGUAGES.filter((language) => found.has(language));
}

/** The language to work in: the requested one, else the only one the Recording folder holds; refused when none or several. */
export function chooseLanguage(
  requested: SpokenLanguage | undefined,
  fileNames: readonly string[],
): { ok: true; language: SpokenLanguage } | { ok: false; reason: string } {
  if (requested !== undefined) return { ok: true, language: requested };
  const available = recordingLanguages(fileNames);
  const [only, ...others] = available;
  if (only !== undefined && others.length === 0) return { ok: true, language: only };
  if (only === undefined)
    return { ok: false, reason: 'the Recording folder has no language-named file yet; pass --lang en|de' };
  return {
    ok: false,
    reason: `the Recording folder holds several languages (${available.join(', ')}); pass --lang ${available.join('|')}`,
  };
}
