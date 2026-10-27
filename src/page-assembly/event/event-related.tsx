import { showsFormat } from '@/episodes/components/episode-browser/episode-browser.pure';
import { EpisodeCardView, type CardLabels } from '@/episodes/components/episode-card/episode-card';
import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import type { EventT } from './event-translator';

interface RelatedProps {
  cards: readonly EpisodeCard[];
  locale: Locale;
  labels: CardLabels;
  t: EventT;
}

/** Other Episodes the visitor may like, as compact cards; no heading and no section when there are none. */
export function RelatedEpisodes({ cards, locale, labels, t }: RelatedProps) {
  if (cards.length === 0) return null;
  const showFormat = showsFormat(cards);
  return (
    <section data-event-related className="mt-12">
      <h2 className="text-subheading font-semibold text-foreground">{t('related')}</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.slug}>
            <EpisodeCardView
              card={card}
              variant="compact"
              headingLevel={3}
              locale={locale}
              labels={labels}
              showFormat={showFormat}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
