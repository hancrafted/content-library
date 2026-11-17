import { TAG_ARTWORK, TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import { EpisodeLinks } from '@/episodes/components/episode-card/episode-links';
import { ReleaseDate } from '@/episodes/components/episode-card/episode-release-date';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardArtwork } from '@/shared/components/ui/card-artwork';
import { CardCaption, CardCue, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { cueOf, isLinked, type CardHeadingLevel, type CardVariant } from '@/shared/components/ui/card-variant.pure';
import type { CardVisualPosition } from '@/shared/components/ui/card-visual';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { VideoLabels } from '@/shared/components/ui/youtube-link';
import type { Locale } from '@/shared/lib/locale.pure';

export interface CardLabels extends VideoLabels {
  readonly open: string;
  readonly comingSoon: string;
}

export type CardLabelRead = (key: 'open' | 'comingSoon' | 'watchVideo' | 'newTab') => string;

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

/** Native actions stay separate from metadata, keeping their hit areas stable as labels wrap. */
function CardFooter({ card, variant, labels, showFormat }: FooterProps) {
  return (
    <div data-card-footer className="mt-auto flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
      <span className="inline-flex flex-wrap items-center gap-3">
        {showFormat && <span className={META}>{card.format.label}</span>}
        <EpisodeLinks card={card} labels={labels} />
      </span>
      <CardCue
        cue={cueOf(card, variant)}
        variant={variant}
        open={labels.open}
        comingSoon={labels.comingSoon}
        ink={isLinked(card)}
      />
    </div>
  );
}

export interface EpisodeCardProps {
  card: EpisodeCard;
  variant: CardVariant;
  headingLevel: CardHeadingLevel;
  locale: Locale;
  labels: CardLabels;
  showFormat: boolean;
  className?: string;
  /** Position of the decorative graphic panel; left by default on every browsing surface. */
  visualPosition?: CardVisualPosition;
}

function dataOf(card: EpisodeCard) {
  return {
    'data-episode-card': '',
    'data-episode-slug': card.slug,
    'data-episode-status': card.status,
    'data-lead-tag': card.leadTag.id,
    'data-format': card.format.id,
  };
}

export function EpisodeCardView(props: EpisodeCardProps) {
  const { card, variant } = props;
  return (
    <CardShell
      variant={variant}
      linked={isLinked(card)}
      accent={tagToken(card.leadTag.id)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag.id]]}
      className={props.className}
      data={dataOf(card)}
      visual={<CardArtwork name={TAG_ARTWORK[card.leadTag.id]} />}
      visualPosition={props.visualPosition ?? 'left'}
      ink
    >
      <CardBody {...props} />
    </CardShell>
  );
}

function CardBody({ card, variant, headingLevel, locale, labels, showFormat }: EpisodeCardProps) {
  return (
    <>
      <CardCategory card={card} />
      <CardTitle variant={variant} title={card.title} route={card.route} locale={locale} level={headingLevel} graphic />
      {card.caption !== '' && (
        <CardCaption variant={variant} graphic>
          {card.caption}
        </CardCaption>
      )}
      <CardDetails card={card} />
      <CardFooter card={card} variant={variant} labels={labels} showFormat={showFormat} />
    </>
  );
}

function CardCategory({ card }: { card: EpisodeCard }) {
  return (
    <span
      data-tag={card.leadTag.id}
      title={card.tags[0]?.tooltip}
      className="relative z-20 inline-flex w-fit items-center gap-2 text-caption font-medium text-(--card-accent)"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {card.leadTag.label}
    </span>
  );
}

function CardDetails({ card }: { card: EpisodeCard }) {
  return (
    <div data-card-meta className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <ReleaseDate card={card} className={META} />
      <BadgeList items={card.tags.slice(1)} data={{ 'data-episode-tags': '' }} />
    </div>
  );
}
