import { CardCaption, CardCue, CardShell, CardTitle } from '@/components/ui/card-shell';
import { cueOf, isLinked, type CardHeadingLevel, type CardVariant } from '@/components/ui/card-variant.pure';
import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import { EpisodeLinks } from '@/episodes/components/episode-card/episode-links';
import { ReleaseDate } from '@/episodes/components/episode-card/episode-release-date';
import { TAG_ACCENTS, TAG_ICONS } from '@/episodes/components/episode-card/episode-visuals';
import type { VideoLabels } from '@/episodes/components/episode-card/episode-youtube-link';
import type { Locale } from '@/lib/locale.pure';
import type { getTranslations } from 'next-intl/server';

/** The strings a card draws that are not on the card itself. */
export interface CardLabels extends VideoLabels {
  readonly open: string;
  readonly comingSoon: string;
}

type LandingT = Awaited<ReturnType<typeof getTranslations<'landing'>>>;

/** The card's own labels, read from the landing Translation file; the one builder every page that draws cards uses. */
export function cardLabels(t: LandingT): CardLabels {
  return {
    open: t('episodeOverview.open'),
    comingSoon: t('episodeOverview.comingSoon'),
    watchVideo: t('episodeOverview.watchVideo'),
    newTab: t('episodeOverview.newTab'),
  };
}

const META = 'text-caption text-muted-foreground';

/** The Episode's Tags as plain labels: no filter acts on them, and each explains itself on hover. */
function CardTags({ card }: { card: EpisodeCard }) {
  if (card.tags.length === 0) return null;
  return (
    <ul data-episode-tags className="relative z-20 flex flex-wrap gap-1.5">
      {card.tags.map((tag) => (
        <li
          key={tag.id}
          data-tag={tag.id}
          title={tag.tooltip}
          className="rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground"
        >
          {tag.label}
        </li>
      ))}
    </ul>
  );
}

interface FooterProps {
  card: EpisodeCard;
  variant: CardVariant;
  labels: CardLabels;
  showFormat: boolean;
}

/** The card's last row: the open cue, then the release date and where else the Episode is published. */
function CardFooter({ card, variant, labels, showFormat }: FooterProps) {
  return (
    <div className="mt-auto flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2">
      <span className="inline-flex items-center gap-3">
        {showFormat && <span className={META}>{card.format.label}</span>}
        <ReleaseDate card={card} className={META} />
        <EpisodeLinks card={card} labels={labels} />
      </span>
      <CardCue cue={cueOf(card, variant)} variant={variant} open={labels.open} comingSoon={labels.comingSoon} />
    </div>
  );
}

export interface EpisodeCardProps {
  card: EpisodeCard;
  variant: CardVariant;
  /** The title's heading level, one below the heading the card sits under. */
  headingLevel: CardHeadingLevel;
  locale: Locale;
  labels: CardLabels;
  /** Whether the card names its Format; see `showsFormat`. */
  showFormat: boolean;
  /** Where the card sits in its grid. */
  className?: string;
}

/** The card's own data attributes, the hooks tests and probes read. */
function dataOf(card: EpisodeCard) {
  return {
    'data-episode-card': '',
    'data-episode-slug': card.slug,
    'data-episode-status': card.status,
    'data-lead-tag': card.leadTag.id,
    'data-format': card.format.id,
  };
}

/**
 * One Episode as a card, in the landing page's style: the lead Tag's accent and
 * icon, title, caption, Tags, release date and video. A published card is a link
 * as a whole; an announced-only one is muted and goes nowhere.
 */
export function EpisodeCardView({
  card,
  variant,
  headingLevel,
  locale,
  labels,
  showFormat,
  className,
}: EpisodeCardProps) {
  return (
    <CardShell
      variant={variant}
      linked={isLinked(card)}
      look={TAG_ACCENTS[card.accent]}
      icon={TAG_ICONS[card.icon]}
      className={className}
      data={dataOf(card)}
    >
      <CardTitle variant={variant} title={card.title} route={card.route} locale={locale} level={headingLevel} />
      <CardCaption variant={variant}>{card.caption}</CardCaption>
      <CardTags card={card} />
      <CardFooter card={card} variant={variant} labels={labels} showFormat={showFormat} />
    </CardShell>
  );
}
