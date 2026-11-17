import { parseSpokenLanguage, SPOKEN_LANGUAGES, type SpokenLanguage } from './transcript.pure.ts';

export interface CommandArgs {
  readonly input: string;
  readonly language?: SpokenLanguage;
  readonly dryRun: boolean;
  readonly force: boolean;
}

function langProblem(argv: readonly string[]): string | undefined {
  const at = argv.indexOf('--lang');
  if (at === -1 || parseSpokenLanguage(argv[at + 1] ?? '') !== undefined) return undefined;
  return `--lang takes ${SPOKEN_LANGUAGES.join(' or ')}, got "${argv[at + 1] ?? ''}"`;
}

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

export function recordingLanguages(fileNames: readonly string[]): SpokenLanguage[] {
  const found = new Set(fileNames.map((name) => LANGUAGE_FILE.exec(name)?.[1]));
  return SPOKEN_LANGUAGES.filter((language) => found.has(language));
}

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
