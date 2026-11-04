import { MagneticInk } from '@/shared/components/animations/magnetic-ink.client';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Card } from './card';
import type { CardHeadingLevel, CardVariant, OpenCue } from './card-variant.pure';
import { CardPicture, CardVisual, type CardVisualPosition } from './card-visual';
import visualStyles from './card-visual.module.css';

/* One native frame and stretched title link; visual panels, static media and corner art share it. */

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
  ink?: boolean;
  visual?: ReactNode;
  visualPosition?: CardVisualPosition;
}

/** The card's frame: the shadcn card surface as an `<article>`, its accent token set once for every part inside. */
export function CardShell(props: ShellProps) {
  const frame = <CardFrame {...props} />;
  return props.ink && props.linked ? <MagneticInk kind="card">{frame}</MagneticInk> : frame;
}

function CardFrame(props: ShellProps) {
  const tone = props.linked ? `${LINKED_FRAME} ${ACCENT.edge}` : UPCOMING_FRAME;
  const style = { '--card-accent': `var(${props.accent})` } as CSSProperties;
  const position = visualPositionOf(props);
  const classes = cn(
    FRAME,
    VARIANTS[props.variant].frame,
    tone,
    props.className,
    props.ink && props.linked && 'overflow-visible',
    (props.visual || props.visualPosition === 'none') && visualStyles.layout,
  );
  return (
    <Card asChild className={classes}>
      <article {...props.data} data-card-variant={props.variant} data-card-visual-position={position} style={style}>
        <CardContents {...props} />
      </article>
    </Card>
  );
}

function visualPositionOf(props: ShellProps) {
  if (props.visualPosition === 'none') return 'none';
  return props.visual ? (props.visualPosition ?? 'left') : undefined;
}

function CardContents(props: ShellProps) {
  if (props.visualPosition === 'none') return <CardVisual>{props.children}</CardVisual>;
  if (props.visual) return <CardVisual visual={props.visual}>{props.children}</CardVisual>;
  return (
    <>
      <CardPicture
        media={props.media}
        classes={VARIANTS[props.variant]}
        linked={props.linked}
        icon={props.icon}
        accent={ACCENT}
      />
      {props.children}
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
  graphic?: boolean;
}

/** The title as the one link on a linked card, stretched over the whole card so the card is the target and its name is just the title. */
export function CardTitle({ variant, title, route, locale, level, graphic = false }: TitleProps) {
  const Heading = `h${level}` as const;
  const classes = `text-foreground ${graphic ? 'text-body font-semibold' : VARIANTS[variant].title}`;
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

export function CardCaption({
  variant,
  children,
  graphic = false,
}: {
  variant: CardVariant;
  children: ReactNode;
  graphic?: boolean;
}) {
  return <p className={`text-muted-foreground ${graphic ? 'text-caption' : VARIANTS[variant].caption}`}>{children}</p>;
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
  ink?: boolean;
}

/** What says the card opens, for the eye only: the title's stretched link is the real target. */
export function CardCue({ cue, variant, open, comingSoon, ink = false }: CueProps) {
  const place = VARIANTS[variant].cue;
  if (cue === 'coming-soon') {
    return (
      <span data-open-cue={cue} className={`${SOON} ${place}`}>
        {comingSoon}
      </span>
    );
  }
  if (ink) return <InkCue open={open} />;
  return <PlainCue cue={cue} variant={variant} open={open} />;
}

function PlainCue({ cue, variant, open }: Pick<CueProps, 'cue' | 'variant' | 'open'>) {
  const place = VARIANTS[variant].cue;
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

function InkCue({ open }: { open: string }) {
  return (
    <span
      aria-hidden
      data-open-cue="button"
      data-ink-primary
      className="ml-auto inline-flex min-h-11 items-center justify-center rounded-full border border-transparent px-4 py-2 text-caption font-medium"
    >
      <span data-ink-label className="inline-flex items-center gap-2">
        {open}
        <ArrowRight className="size-4" />
      </span>
    </span>
  );
}

/** The quiet arrow of a linked card: hover-only on a pointer, always shown on touch. */
export function CardArrow({ variant }: { variant: CardVariant }) {
  return <ArrowUpRight aria-hidden data-open-cue="arrow" className={`${ARROW} ${VARIANTS[variant].cue}`} />;
}
