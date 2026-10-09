import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { EPISODE_ACCENTS, EPISODE_ICONS } from '@/components/landing/episode-visuals';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

/** The strings a card draws that are not on the card itself. */
export interface CardLabels {
  readonly open: string;
  readonly comingSoon: string;
  readonly minutesUnit: string;
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
  if (card.route === null) {
    return (
      <p className="mt-auto flex items-center justify-between gap-3 pt-3">
        <span className={META}>{card.topic.label}</span>
        <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          {labels.comingSoon}
        </span>
      </p>
    );
  }
  return (
    <p className="mt-auto flex items-center justify-between gap-3 pt-3">
      <span className={META}>{card.topic.label}</span>
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-foreground">
        {card.minutes !== undefined && (
          <span className="text-muted-foreground">
            {card.minutes} {labels.minutesUnit}
          </span>
        )}
        <ArrowUpRight
          aria-hidden
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
        />
      </span>
    </p>
  );
}

/** A compact Episode card for the Browse grid: a published one is a link, an upcoming one a muted card with a "coming soon" tag and no link. */
export function EpisodeGridCard({ card, locale, labels }: { card: EpisodeCard; locale: Locale; labels: CardLabels }) {
  const Icon = EPISODE_ICONS[card.icon];
  const upcoming = card.route === null;
  const accent = EPISODE_ACCENTS[card.accent];
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
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${upcoming ? 'bg-muted text-muted-foreground' : accent.tile}`}
        >
          <Icon aria-hidden className="h-[1.1rem] w-[1.1rem]" />
        </span>
        <span className={META}>{card.format.label}</span>
      </div>
      <CardTitle card={card} locale={locale} />
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{card.caption}</p>
      <CardFooter card={card} labels={labels} />
    </article>
  );
}
