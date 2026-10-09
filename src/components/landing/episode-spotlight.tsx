import { spotlightOf } from '@/components/landing/episode-browse.pure';
import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import type { CardLabels } from '@/components/landing/episode-grid-card';
import { EPISODE_ACCENTS, EPISODE_ICONS, type AccentClasses } from '@/components/landing/episode-visuals';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Size = 'lead' | 'side';

/** What differs between the lead and a card beside it; whole class strings, so Tailwind can see each one. */
const SIZES: Record<Size, { pad: string; tile: string; glyph: string; art: string; title: string; caption: string }> = {
  lead: {
    pad: 'p-7 sm:p-10 lg:min-h-[22rem]',
    tile: 'h-12 w-12',
    glyph: 'h-6 w-6',
    art: '-bottom-8 -right-8 h-64 w-64',
    title: 'max-w-xl text-3xl leading-[1.1] sm:text-4xl',
    caption: 'max-w-lg text-base sm:text-lg',
  },
  side: {
    pad: 'p-6 sm:p-7',
    tile: 'h-10 w-10',
    glyph: 'h-5 w-5',
    art: '-bottom-5 -right-5 h-32 w-32',
    title: 'text-xl leading-snug',
    caption: 'line-clamp-3 text-sm',
  },
};

/** Where each card sits: the lead spans two thirds and the full height of the stack beside it, and fills the row when nothing sits beside it. */
function placement(size: Size, sideCount: number): string {
  if (size === 'side') return sideCount === 1 ? 'md:col-span-2 lg:col-span-1' : '';
  if (sideCount === 0) return 'md:col-span-2 lg:col-span-3';
  return sideCount === 1 ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-2 lg:col-span-2 lg:row-span-2';
}

const META = 'font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground';

const FRAME =
  'group relative isolate flex flex-col gap-4 overflow-hidden rounded-3xl border border-border/60 bg-background transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-xl has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-foreground/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0';

/** The corner wash and the large faded glyph behind the text; decorative, so they take no clicks and sit under the content. */
function Art({ card, size, accent }: { card: EpisodeCard; size: Size; accent: AccentClasses }) {
  const Icon = EPISODE_ICONS[card.icon];
  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-linear-to-br ${accent.wash} via-transparent to-transparent`}
      />
      <Icon
        aria-hidden
        className={`pointer-events-none absolute -z-10 opacity-[0.08] transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none ${accent.ink} ${SIZES[size].art}`}
      />
    </>
  );
}

function Kicker({ card, size, accent }: { card: EpisodeCard; size: Size; accent: AccentClasses }) {
  const Icon = EPISODE_ICONS[card.icon];
  const { tile, glyph } = SIZES[size];
  return (
    <div className="flex items-center gap-3">
      <span className={`flex items-center justify-center rounded-2xl ${accent.tile} ${tile}`}>
        <Icon aria-hidden className={glyph} />
      </span>
      <p className={META}>
        {card.topic.label}
        <span aria-hidden className="px-2 opacity-50">
          /
        </span>
        {card.format.label}
      </p>
    </div>
  );
}

const LEAD_CTA =
  'inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-[gap] duration-200 group-hover:gap-3 motion-reduce:transition-none';
const SIDE_CTA =
  'inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground';

/** The visible call to action; the title's stretched link is the real target, so this is for the eye only. */
function Footer({ card, size, labels }: { card: EpisodeCard; size: Size; labels: CardLabels }) {
  return (
    <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
      <span aria-hidden className={size === 'lead' ? LEAD_CTA : SIDE_CTA}>
        {labels.open}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
      </span>
      {card.minutes !== undefined && (
        <span className={META}>
          {card.minutes} {labels.minutesUnit}
        </span>
      )}
    </p>
  );
}

interface CardProps {
  card: EpisodeCard;
  size: Size;
  sideCount: number;
  locale: Locale;
  labels: CardLabels;
}

function SpotlightCard({ card, size, sideCount, locale, labels }: CardProps) {
  if (card.route === null) return null;
  const accent = EPISODE_ACCENTS[card.accent];
  const { pad, title, caption } = SIZES[size];
  return (
    <article
      data-episode-card
      data-episode-slug={card.slug}
      data-episode-status={card.status}
      data-spotlight={size}
      className={`${FRAME} ${accent.edge} ${pad} ${placement(size, sideCount)}`}
    >
      <Art card={card} size={size} accent={accent} />
      <Kicker card={card} size={size} accent={accent} />
      <h4 className={`font-bold tracking-tight text-foreground ${title}`}>
        <Link
          href={localizePath(card.route, locale)}
          className="outline-none after:absolute after:inset-0 after:z-10 after:content-['']"
        >
          {card.title}
        </Link>
      </h4>
      <p className={`leading-relaxed text-muted-foreground ${caption}`}>{card.caption}</p>
      <Footer card={card} size={size} labels={labels} />
    </article>
  );
}

interface SpotlightProps {
  cards: readonly EpisodeCard[];
  locale: Locale;
  labels: CardLabels;
}

/**
 * The hottest published Episodes as an asymmetric bento: a lead card and up to
 * two beside it. Static, never rotating; an upcoming Episode never reaches it,
 * because the selection only takes published cards. DOM order is reading order.
 */
export function EpisodeSpotlight({ cards, locale, labels }: SpotlightProps) {
  const { lead, side } = spotlightOf(cards);
  if (lead === null) return null;
  const shared = { sideCount: side.length, locale, labels };
  return (
    <div data-episode-spotlight className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SpotlightCard card={lead} size="lead" {...shared} />
      {side.map((card) => (
        <SpotlightCard key={card.slug} card={card} size="side" {...shared} />
      ))}
    </div>
  );
}
