import type { Video } from '@/content-store/store';
import { readTranslationStrings } from '@/shared/i18n/translation-strings';
import type { Locale } from '@/shared/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import type { RecordingLanguage, TalkPlayerLabels } from './talk-player.client';

export async function tocLabelsOf(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'tableOfContents' });
  const strings = await readTranslationStrings(locale, 'tableOfContents', ['remaining']);
  return {
    ...strings,
    remaining: { one: t.raw('remaining.one') as string, other: t.raw('remaining.other') as string },
  };
}

export async function talkOf(
  locale: Locale,
  video: Video | undefined,
): Promise<{ talkLabels?: TalkPlayerLabels; recording?: RecordingLanguage }> {
  if (video === undefined) return {};
  const talkLabels = await readTranslationStrings(locale, 'talkPlayer', ['recordedIn']);
  if (video.recordedIn === undefined) return { talkLabels };
  const t = await getTranslations({ locale, namespace: 'talkPlayer' });
  return { talkLabels, recording: { language: video.recordedIn, label: t(`recordedIn.${video.recordedIn}`) } };
}
