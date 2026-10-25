import { CardCaption, CardCue, CardShell, CardTitle } from '@/components/landing/card-shell';
import { cueOf, isLinked, type CardHeadingLevel, type CardVariant } from '@/components/landing/card-variant.pure';
import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { EpisodeLinks } from '@/components/landing/episode-links';
import { ReleaseDate } from '@/components/landing/episode-release-date';
import { THEME_ICONS } from '@/components/landing/episode-visuals';
import type { VideoLabels } from '@/components/landing/episode-youtube-link';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { conceptRoute } from '@/lib/routes';
import type { getTranslations } from 'next-intl/server';
import Link from 'next/link';

/** The strings a card draws that are not on the card itself. */
export interface CardLabels extends VideoLabels {
  readonly open: string;
  readonly comingSoon: string;
  /** What marks a Concept link as leading to an English page, on a page in another locale. */
  readonly conceptInEnglish: { readonly mark: string; readonly label: string };
}

type LandingT = Awaited<ReturnType<typeof getTranslations<'landing'>>>;

/** The card's own labels, read from the landing Translation file; the one builder every page that draws cards uses. */
export function cardLabels(t: LandingT): CardLabels {
  return {
    open: t('episodeOverview.open'),
    comingSoon: t('episodeOverview.comingSoon'),
    watchVideo: t('episodeOverview.watchVideo'),
    newTab: t('episodeOverview.newTab'),
    conceptInEnglish: {
      mark: t('episodeOverview.conceptInEnglish.mark'),
      label: t('episodeOverview.conceptInEnglish.label'),
    },
  };
}

const META = 'text-caption text-muted-foreground';

interface ConceptsProps {
  card: EpisodeCard;
  locale: Locale;
  inEnglish: CardLabels['conceptInEnglish'];
}

/**
 * The Episode's top Concepts, each a link to its Concept page above the card's own link, explaining itself on hover.
 * A Concept page is English only (design-ADR 0016), so on a page in another locale the link says so.
 */
function CardConcepts({ card, locale, inEnglish }: ConceptsProps) {
  if (card.concepts.length === 0) return null;
  const foreign = locale !== 'en';
  return (
    <ul data-episode-concepts className="relative z-20 flex flex-wrap gap-1.5">
      {card.concepts.map((concept) => (
        <li key={concept.id} data-concept={concept.id}>
          <Link
            href={localizePath(conceptRoute(concept.id), 'en')}
            hrefLang="en"
            title={concept.tooltip}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-caption text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          >
            {concept.label}
            {foreign && (
              <>
                <span aria-hidden data-concept-in-english className="font-semibold tracking-wider">
                  {inEnglish.mark}
                </span>
                <span className="sr-only">{inEnglish.label}</span>
              </>
            )}
          </Link>
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
  /** A short label under the title, what an Event's Playlist says of an Episode: "Event page", "Unlisted". */
  chip?: string;
}

/** The short label under the title, when the card carries one. */
function CardChip({ chip }: { chip: string | undefined }) {
  if (chip === undefined) return null;
  return (
    <span
      data-episode-chip
      className="w-fit rounded-full border border-border px-2 py-0.5 text-caption font-medium text-muted-foreground"
    >
      {chip}
    </span>
  );
}

/** The card's own data attributes, the hooks tests and probes read. */
function dataOf(card: EpisodeCard) {
  return {
    'data-episode-card': '',
    'data-episode-slug': card.slug,
    'data-episode-status': card.status,
    'data-theme-concept': card.themeConcept.id,
    'data-format': card.format.id,
  };
}

/**
 * One Episode as a card, in the landing page's style: the theme Concept's accent and
 * icon, title, caption, Concepts, release date and video. A published card is a link
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
  chip,
}: EpisodeCardProps) {
  return (
    <CardShell
      variant={variant}
      linked={isLinked(card)}
      accent={card.accent}
      icon={THEME_ICONS[card.icon]}
      className={className}
      data={dataOf(card)}
    >
      <CardTitle variant={variant} title={card.title} route={card.route} locale={locale} level={headingLevel} />
      <CardChip chip={chip} />
      <CardCaption variant={variant}>{card.caption}</CardCaption>
      <CardConcepts card={card} locale={locale} inEnglish={labels.conceptInEnglish} />
      <CardFooter card={card} variant={variant} labels={labels} showFormat={showFormat} />
    </CardShell>
  );
}
