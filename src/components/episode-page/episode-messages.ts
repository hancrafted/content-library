import type { AnyEpisodeRecord } from '@/components/slide-master/episode-record';
import type { EpisodeMessages } from '@/components/slide-master/slide';
import type { Locale } from '@/lib/locale.pure';

/**
 * An Episode's own text in one locale: its title, caption and description,
 * what the Title slide, the page metadata and the landing card read. A
 * self-contained Episode carries it in its folder's Translation files. Every
 * Episode is self-contained now (#51), so the site-wide file holds none;
 * #58 removes the old record type this guard still has to accept.
 */
export function episodeMessagesOf(record: AnyEpisodeRecord, locale: Locale): EpisodeMessages {
  if ('messages' in record) return record.messages[locale];
  throw new Error('An Episode record without its own messages: every Episode carries its text in `i18n/`.');
}
