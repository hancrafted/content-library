import type { AnyEpisodeRecord } from '@/components/slide-master/episode-record';
import type { EpisodeMessages } from '@/components/slide-master/slide';
import { TRANSLATIONS } from '@/i18n/translations';
import type { Locale } from '@/lib/locale.pure';

/**
 * An Episode's own text in one locale: its title, caption and description,
 * what the Title slide, the page metadata and the landing card read. A
 * self-contained Episode carries it in its folder's Translation files; an
 * Episode not yet moved still reads `episodes.<ep>` of the site-wide file.
 */
export function episodeMessagesOf(record: AnyEpisodeRecord, locale: Locale): EpisodeMessages {
  if ('messages' in record) return record.messages[locale];
  const { title, caption, description } = TRANSLATIONS[locale].episodes[record.slug];
  return { title, caption, description };
}
