import { AiMarker } from '@/components/landing/episode-ai-marker';
import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { TOPIC_ACCENTS, TOPIC_ICONS } from '@/components/landing/episode-visuals';
import { YoutubeLink, type VideoLabels } from '@/components/landing/episode-youtube-link';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

/** The strings a card draws that are not on the card itself. */
export interface CardLabels extends VideoLabels {
  readonly open: string;
  readonly comingSoon: string;
}

const CARD =
  'group relative isolate flex w-full flex-col gap-3 rounded-2xl border p-5 transition-[border-color,box-shadow,transform] duration-200 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-foreground/50 motion-reduce:transition-none';

const META = 'font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground';

/** The title as the one link on a published card, stretched over the whole card so the card is the target and its name is just the title. */
function CardTitle({ card, locale }: { card: EpisodeCard; locale: Locale }) {
  const classes = 'text-base font-semibold leading-snug tracking-tight text-foreground';
  if (card.route === null) return <h4 className={classes}>{card.title}</h4>;
  return (
    <h4 className={classes}>
      <Link
        href={localizePath(card.route, locale)}
        className="outline-none after:absolute after:inset-0 after:z-10 after:content-['']"
      >
        {card.title}
      </Link>
    </h4>
  );
}

function CardFooter({ card, labels }: { card: EpisodeCard; labels: CardLabels }) {
  return (
    <p className="mt-auto flex min-h-6 items-center justify-end pt-3">
      {card.route === null ? (
        <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          {labels.comingSoon}
        </span>
      ) : (
        <ArrowUpRight
          aria-hidden
          className="h-3.5 w-3.5 text-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
        />
      )}
    </p>
  );
}

interface HeadProps {
  card: EpisodeCard;
  tile: string;
  showFormat: boolean;
  labels: CardLabels;
}

/** The card's first row: the Topic's icon and name on the left, the Format (once there are two) and the video on the right. */
function CardHead({ card, tile, showFormat, labels }: HeadProps) {
  const Icon = TOPIC_ICONS[card.icon];
  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tile}`}>
          <Icon aria-hidden className="h-[1.1rem] w-[1.1rem]" />
        </span>
        <span className={META}>{card.topic.label}</span>
        <AiMarker card={card} />
      </span>
      <span className="inline-flex items-center gap-3">
        {showFormat && <span className={META}>{card.format.label}</span>}
        <YoutubeLink card={card} labels={labels} />
      </span>
    </div>
  );
}

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
          className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] leading-snug text-muted-foreground"
        >
          {tag.label}
        </li>
      ))}
    </ul>
  );
}

/** A compact Episode card for the Browse grid: a published one is a link, an upcoming one a muted card with a "coming soon" tag and no link. */
export interface GridCardProps {
  card: EpisodeCard;
  locale: Locale;
  labels: CardLabels;
  /** Whether the card names its Format; see `showsFormat`. */
  showFormat: boolean;
}

export function EpisodeGridCard({ card, locale, labels, showFormat }: GridCardProps) {
  const upcoming = card.route === null;
  const accent = TOPIC_ACCENTS[card.accent];
  const tone = upcoming
    ? 'border-dashed border-border bg-muted/40'
    : `border-border/60 bg-background hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0 ${accent.edge}`;
  return (
    <article
      data-episode-card
      data-episode-slug={card.slug}
      data-episode-status={card.status}
      data-topic={card.topic.id}
      data-format={card.format.id}
      className={`${CARD} ${tone}`}
    >
      <CardHead
        card={card}
        tile={upcoming ? 'bg-muted text-muted-foreground' : accent.tile}
        showFormat={showFormat}
        labels={labels}
      />
      <CardTitle card={card} locale={locale} />
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{card.caption}</p>
      <CardTags card={card} />
      <CardFooter card={card} labels={labels} />
    </article>
  );
}
