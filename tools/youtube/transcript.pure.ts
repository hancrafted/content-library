export const SPOKEN_LANGUAGES = ['en', 'de'] as const;
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];

export const DEFAULT_SPOKEN_LANGUAGE: SpokenLanguage = 'en';

export const RECORDING_FOLDER = 'recording';

export function parseSpokenLanguage(answer: string): SpokenLanguage | undefined {
  const text = answer.trim().toLowerCase();
  return SPOKEN_LANGUAGES.find((language) => language === text);
}

export function transcriptFile(language: SpokenLanguage): string {
  return `${RECORDING_FOLDER}/transcript.${language}.vtt`;
}

export function captionFile(files: readonly string[], videoId: string, language: SpokenLanguage): string | undefined {
  const plain = `${videoId}.${language}.vtt`;
  if (files.includes(plain)) return plain;
  return files.find((file) => file === `${videoId}.${language}-orig.vtt`);
}

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

export function videoFile(language: SpokenLanguage): string {
  return `${RECORDING_FOLDER}/video.${language}.json`;
}

export function ytDlpDurationArgs(videoId: string): string[] {
  return ['--skip-download', '--print', 'duration', `https://www.youtube.com/watch?v=${videoId}`];
}

export function parseDuration(output: string): number | undefined {
  const seconds = Number(output.trim());
  return Number.isInteger(seconds) && seconds > 0 ? seconds : undefined;
}

export function videoFileText(videoId: string, durationSeconds: number): string {
  return `${JSON.stringify({ videoId, durationSeconds }, null, 2)}\n`;
}
