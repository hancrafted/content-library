import { TAG_ACCENTS, TAG_ICONS } from '@/components/landing/episode-visuals';
import type { Accent, TagIcon } from '@/lib/episode-overview';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CardVariant, OpenCue } from './card-variant.pure';

/*
 * The parts every card is built from, whatever it lists: the frame with its
 * accent wash and faded icon, the title as the card's one stretched link, and
 * the cue that says it opens. What differs per variant is one table row, so a
 * new variant adds a row here and its own body, never a second frame.
 */

interface VariantClasses {
  /** The frame's corner radius, padding and height. */
  readonly frame: string;
  /** Where the large faded icon sits and how big it is. */
  readonly art: string;
  readonly title: string;
  readonly caption: string;
  /** Moves the cue to the footer's start (the lead's button) or leaves it at the end. */
  readonly cue: string;
}

/** Whole class strings, so Tailwind can see each one. */
export const VARIANTS: Record<CardVariant, VariantClasses> = {
  lead: {
    frame: 'rounded-3xl p-7 sm:p-10 lg:min-h-[22rem]',
    art: '-bottom-8 -right-8 size-64',
    title: 'max-w-xl text-subheading font-semibold',
    caption: 'max-w-lg text-body',
    cue: 'order-first',
  },
  compact: {
    frame: 'rounded-2xl p-6',
    art: '-bottom-5 -right-5 size-32',
    title: 'text-body font-semibold',
    caption: 'line-clamp-3 text-caption',
    cue: '',
  },
};

const FRAME =
  'group relative isolate flex w-full flex-col gap-4 overflow-hidden border bg-background transition-[border-color,box-shadow,translate] duration-300 has-[[data-card-link]:focus-visible]:ring-2 has-[[data-card-link]:focus-visible]:ring-foreground/50 motion-reduce:transition-none';
const LINKED_FRAME = 'border-border/60 hover:shadow-lg motion-safe:hover:-translate-y-0.5';
const UPCOMING_FRAME = 'border-dashed border-border bg-muted/40';

interface ShellProps {
  variant: CardVariant;
  /** False for an announced-only card: muted, no wash, no icon, no hover. */
  linked: boolean;
  accent: Accent;
  icon: TagIcon;
  /** The card's own data attributes, so each card kind keeps its own hooks for tests and probes. */
  data: Record<`data-${string}`, string | undefined>;
  className?: string;
  children: ReactNode;
}

export function CardShell({ variant, linked, accent, icon, data, className = '', children }: ShellProps) {
  const look = TAG_ACCENTS[accent];
  const tone = linked ? `${LINKED_FRAME} ${look.edge}` : UPCOMING_FRAME;
  return (
    <article
      {...data}
      data-card-variant={variant}
      className={`${FRAME} ${VARIANTS[variant].frame} ${tone} ${className}`}
    >
      {linked && <CardArt accent={accent} icon={icon} classes={VARIANTS[variant].art} />}
      {children}
    </article>
  );
}

/** The corner wash and the large faded icon behind the text; decorative, so they take no clicks and sit under the content. */
function CardArt({ accent, icon, classes }: { accent: Accent; icon: TagIcon; classes: string }) {
  const look = TAG_ACCENTS[accent];
  const Icon = TAG_ICONS[icon];
  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-linear-to-br ${look.wash} via-transparent to-transparent`}
      />
      <Icon
        aria-hidden
        className={`pointer-events-none absolute -z-10 opacity-[0.08] transition-transform duration-500 motion-safe:group-hover:-rotate-3 motion-safe:group-hover:scale-105 motion-reduce:transition-none ${look.ink} ${classes}`}
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
}

/** The title as the one link on a linked card, stretched over the whole card so the card is the target and its name is just the title. */
export function CardTitle({ variant, title, route, locale }: TitleProps) {
  const classes = `text-foreground ${VARIANTS[variant].title}`;
  if (route === null) return <h4 className={classes}>{title}</h4>;
  return (
    <h4 className={classes}>
      <Link
        data-card-link
        href={localizePath(route, locale)}
        className="outline-none after:absolute after:inset-0 after:z-10 after:content-['']"
      >
        {title}
      </Link>
    </h4>
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
  return <ArrowUpRight aria-hidden data-open-cue={cue} className={`${ARROW} ${place}`} />;
}
