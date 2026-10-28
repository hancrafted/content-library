// `npm run youtube:transcript`: the pure half — which language, which file yt-dlp's captions land in, where they are
// stored. The shell (`transcript.ts`) runs yt-dlp and the disk.

export const SPOKEN_LANGUAGES = ['en', 'de'] as const;
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];

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
