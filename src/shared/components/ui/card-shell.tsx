import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Card } from './card';
import type { CardHeadingLevel, CardVariant, OpenCue } from './card-variant.pure';

/*
 * The parts every card is built from, whatever it lists: the frame with its
 * accent wash and faded icon, the title as the card's one stretched link, and
 * the cue that says it opens. What differs per variant is one table row, so a
 * new variant adds a row here and its own body, never a second frame.
 */

/** A colour token's name (`--tag-agentic-ai`, `--primary`): the card draws its icon, ink, wash and edge from it. */
export type AccentToken = `--${string}`;

/**
 * The accent drawn from the card's own `--card-accent`, which the shell sets to the token it is given: whole class
 * strings Tailwind can see, so any token colours a card and none is named here. The ink is the token itself, which
 * reads 4.5:1 on the page in both themes; the wash and the edge are tints of it.
 */
export const ACCENT = {
  ink: 'text-(--card-accent)',
  wash: 'from-(--card-accent)/15',
  edge: 'hover:border-(--card-accent)/50 has-[a:focus-visible]:border-(--card-accent)/50',
} as const;

interface VariantClasses {
  /** The frame's corner radius, padding and height. */
  readonly frame: string;
  /** Where the large faded icon sits and how big it is. */
  readonly art: string;
  readonly title: string;
  readonly caption: string;
  /** Pulls the media strip out to the frame's edges, cancelling its padding. */
  readonly media: string;
  /** Moves the cue to the footer's start (the lead's button) or leaves it at the end. */
  readonly cue: string;
}

/** Whole class strings, so Tailwind can see each one. */
export const VARIANTS: Record<CardVariant, VariantClasses> = {
  lead: {
    frame: 'rounded-3xl p-7 sm:p-10 lg:min-h-[22rem]',
    media: '-mx-7 -mt-7 sm:-mx-10 sm:-mt-10',
    art: '-bottom-8 -right-8 size-64',
    title: 'max-w-xl text-subheading font-semibold',
    caption: 'max-w-lg text-body',
    cue: 'order-first',
  },
  compact: {
    frame: 'rounded-2xl p-6',
    media: '-mx-6 -mt-6',
    art: '-bottom-5 -right-5 size-32',
    title: 'text-body font-semibold',
    caption: 'line-clamp-3 text-caption',
    cue: '',
  },
  event: {
    frame: 'rounded-2xl p-6',
    media: '-mx-6 -mt-6',
    art: '-bottom-6 -right-6 size-36',
    title: 'text-body font-semibold',
    caption: 'line-clamp-3 text-caption',
    cue: '',
  },
};

const FRAME =
  'group relative isolate w-full gap-4 overflow-hidden bg-background py-0 shadow-none transition-[border-color,box-shadow,translate] duration-300 has-[[data-card-link]:focus-visible]:ring-2 has-[[data-card-link]:focus-visible]:ring-foreground/50 motion-reduce:transition-none';
const LINKED_FRAME = 'border-border/60 hover:shadow-lg motion-safe:hover:-translate-y-0.5';
const UPCOMING_FRAME = 'border-dashed border-border bg-muted/40';

interface ShellProps {
  variant: CardVariant;
  /** False for an announced-only card: muted, no wash, no icon, no hover. */
  linked: boolean;
  /** The colour token the card draws its accent from: a Tag's (`--tag-agentic-ai`) or the site's `--primary`. */
  accent: AccentToken;
  icon: LucideIcon;
  /** The card's own data attributes, so each card kind keeps its own hooks for tests and probes. */
  data: Record<`data-${string}`, string | undefined>;
  /**
   * A decorative picture for a dark strip across the card's top, in place of the corner wash and faded icon: static
   * by contract (a grid of cards runs no loops). The strip is dark in both themes (ink on `--primary`, or on `--background`
   * in the dark theme), so the picture draws in `currentColor`.
   */
  media?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** The card's frame: the shadcn card surface as an `<article>`, its accent token set once for every part inside. */
export function CardShell({ variant, linked, accent, icon, data, media, className = '', children }: ShellProps) {
  const tone = linked ? `${LINKED_FRAME} ${ACCENT.edge}` : UPCOMING_FRAME;
  const style = { '--card-accent': `var(${accent})` } as CSSProperties;
  return (
    <Card asChild className={cn(FRAME, VARIANTS[variant].frame, tone, className)}>
      <article {...data} data-card-variant={variant} style={style}>
        {media ? (
          <div
            aria-hidden
            data-card-media
            className={`h-24 shrink-0 overflow-hidden bg-primary text-primary-foreground dark:border-b dark:border-border/60 dark:bg-background dark:text-foreground ${VARIANTS[variant].media}`}
          >
            {media}
          </div>
        ) : (
          linked && <CardArt icon={icon} classes={VARIANTS[variant].art} />
        )}
        {children}
      </article>
    </Card>
  );
}

/** The corner wash and the large faded icon behind the text; decorative, so they take no clicks and sit under the content. */
function CardArt({ icon: Icon, classes }: { icon: LucideIcon; classes: string }) {
  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-linear-to-br ${ACCENT.wash} via-transparent to-transparent`}
      />
      <Icon
        aria-hidden
        className={`pointer-events-none absolute -z-10 opacity-[0.08] transition-transform duration-500 motion-safe:group-hover:-rotate-3 motion-safe:group-hover:scale-105 motion-reduce:transition-none ${ACCENT.ink} ${classes}`}
      />
    </>
  );
}

interface TitleProps {
  variant: CardVariant;
  title: string;
  /** The locale-neutral path of what the card opens; `null` draws a plain heading. */
  route: string | null;
  locale: Locale;
  level: CardHeadingLevel;
}

/** The title as the one link on a linked card, stretched over the whole card so the card is the target and its name is just the title. */
export function CardTitle({ variant, title, route, locale, level }: TitleProps) {
  const Heading = `h${level}` as const;
  const classes = `text-foreground ${VARIANTS[variant].title}`;
  if (route === null) return <Heading className={classes}>{title}</Heading>;
  return (
    <Heading className={classes}>
      <Link
        data-card-link
        href={localizePath(route, locale)}
        className="outline-none after:absolute after:inset-0 after:z-10 after:content-['']"
      >
        {title}
      </Link>
    </Heading>
  );
}

export function CardCaption({ variant, children }: { variant: CardVariant; children: ReactNode }) {
  return <p className={`text-muted-foreground ${VARIANTS[variant].caption}`}>{children}</p>;
}

const BUTTON =
  'inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-body font-semibold text-background transition-[gap] duration-200 group-hover:gap-3 motion-reduce:transition-none motion-reduce:group-hover:gap-2';

/** Hidden until the card is hovered or its link focused; a touch screen has no hover, so it stays shown there. */
const ARROW =
  'ml-auto size-4 text-foreground opacity-0 transition-[opacity,translate] duration-200 group-hover:opacity-100 group-has-[[data-card-link]:focus-visible]:opacity-100 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 [@media(hover:none)]:opacity-100 motion-reduce:transition-none';

const SOON = 'rounded-full border border-border px-2.5 py-0.5 text-caption font-medium text-muted-foreground';

interface CueProps {
  cue: OpenCue;
  variant: CardVariant;
  open: string;
  comingSoon: string;
}

/** What says the card opens, for the eye only: the title's stretched link is the real target. */
export function CardCue({ cue, variant, open, comingSoon }: CueProps) {
  const place = VARIANTS[variant].cue;
  if (cue === 'coming-soon') {
    return (
      <span data-open-cue={cue} className={`${SOON} ${place}`}>
        {comingSoon}
      </span>
    );
  }
  if (cue === 'button') {
    return (
      <span aria-hidden data-open-cue={cue} className={`${BUTTON} ${place}`}>
        {open}
        <ArrowRight className="size-4" />
      </span>
    );
  }
  return <CardArrow variant={variant} />;
}

/** The quiet arrow of a linked card: hover-only on a pointer, always shown on touch. */
export function CardArrow({ variant }: { variant: CardVariant }) {
  return <ArrowUpRight aria-hidden data-open-cue="arrow" className={`${ARROW} ${VARIANTS[variant].cue}`} />;
}
