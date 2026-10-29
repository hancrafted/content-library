// `npm run youtube:transcript`: the pure half — which language, which file yt-dlp's captions land in, where they are
// stored. The shell (`transcript.ts`) runs yt-dlp and the disk.
/** The languages a recording can be spoken in: the site's locales (`src/shared/lib/locale.pure.ts`, which tools may not import; `site-tables.test.ts` asserts the two agree). */
export const SPOKEN_LANGUAGES = ['en', 'de'] as const;
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];

/** The language the site serves unprefixed. */
export const DEFAULT_SPOKEN_LANGUAGE: SpokenLanguage = 'en';

/** The Recording folder inside an Episode's folder, next to the Brief. */
export const RECORDING_FOLDER = 'recording';

/** The spoken language in an answer, or undefined when it is neither `en` nor `de`. */
export function parseSpokenLanguage(answer: string): SpokenLanguage | undefined {
  const text = answer.trim().toLowerCase();
  return SPOKEN_LANGUAGES.find((language) => language === text);
}

/** The Recording folder file the raw captions are stored in, relative to the Episode's folder. */
export function transcriptFile(language: SpokenLanguage): string {
  return `${RECORDING_FOLDER}/transcript.${language}.vtt`;
}

/**
 * The caption file yt-dlp wrote for a video among `files`, or undefined when YouTube had none. yt-dlp names an
 * uploaded track `<id>.<lang>.vtt` and an automatic one `<id>.<lang>.vtt` or `<id>.<lang>-orig.vtt`; the plain one wins.
 */
export function captionFile(files: readonly string[], videoId: string, language: SpokenLanguage): string | undefined {
  const plain = `${videoId}.${language}.vtt`;
  if (files.includes(plain)) return plain;
  return files.find((file) => file === `${videoId}.${language}-orig.vtt`);
}

/** The yt-dlp arguments that fetch only the captions of a video in a language, into `dir`, as VTT. */
export function ytDlpArgs(videoId: string, language: SpokenLanguage, dir: string): string[] {
  return [
    '--skip-download',
    '--write-subs',
    '--write-auto-subs',
    '--sub-langs',
    `${language},${language}-orig`,
    '--sub-format',
    'vtt',
    '--output',
    `${dir}/%(id)s`,
    `https://www.youtube.com/watch?v=${videoId}`,
  ];
}

/** The Recording folder file the video's length is stored in, relative to the Episode's folder. */
export function videoFile(language: SpokenLanguage): string {
  return `${RECORDING_FOLDER}/video.${language}.json`;
}

/** The yt-dlp arguments that print only the length of a video, in seconds. */
export function ytDlpDurationArgs(videoId: string): string[] {
  return ['--skip-download', '--print', 'duration', `https://www.youtube.com/watch?v=${videoId}`];
}

/** The seconds yt-dlp printed, or undefined when the output is no positive whole number. */
export function parseDuration(output: string): number | undefined {
  const seconds = Number(output.trim());
  return Number.isInteger(seconds) && seconds > 0 ? seconds : undefined;
}

/** The text of the video file: the video and its length, as the Recording model reads them. */
export function videoFileText(videoId: string, durationSeconds: number): string {
  return `${JSON.stringify({ videoId, durationSeconds }, null, 2)}\n`;
}
