import { TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import { EpisodeLinks } from '@/episodes/components/episode-card/episode-links';
import { ReleaseDate } from '@/episodes/components/episode-card/episode-release-date';
import type { VideoLabels } from '@/episodes/components/episode-card/episode-youtube-link';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardCaption, CardCue, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { cueOf, isLinked, type CardHeadingLevel, type CardVariant } from '@/shared/components/ui/card-variant.pure';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';

/** The strings a card draws that are not on the card itself. */
export interface CardLabels extends VideoLabels {
  readonly open: string;
  readonly comingSoon: string;
}

/** Reads one of the card's own labels, a key of the Episode browser's Translation files (`episodeBrowser.<key>`). */
export type CardLabelRead = (key: 'open' | 'comingSoon' | 'watchVideo' | 'newTab') => string;

/** The card's own labels, read from the Episode browser's Translation file; the one builder every page that draws cards uses. */
export function cardLabels(t: CardLabelRead): CardLabels {
  return {
    open: t('open'),
    comingSoon: t('comingSoon'),
    watchVideo: t('watchVideo'),
    newTab: t('newTab'),
  };
}

const META = 'text-caption text-muted-foreground';

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
      accent={tagToken(card.leadTag.id)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag.id]]}
      className={className}
      data={dataOf(card)}
    >
      <CardTitle variant={variant} title={card.title} route={card.route} locale={locale} level={headingLevel} />
      <CardCaption variant={variant}>{card.caption}</CardCaption>
      <BadgeList items={card.tags} data={{ 'data-episode-tags': '' }} />
      <CardFooter card={card} variant={variant} labels={labels} showFormat={showFormat} />
    </CardShell>
  );
}
