import { localizePath, stripLocale, type Locale } from '@/shared/lib/locale.pure';

/*
 * The parts around the route's pieces: the link between two pieces, the skip arc over the AI agent piece and the
 * technical route as a dashed side road. Plain props, no kit.
 */

/** A Slide link (`slideHref`) and the page's locale, as the one `href` FE-003 allows: through `localizePath`. */
interface SlideLink {
  readonly link: string;
  readonly locale: Locale;
}

/** A Slide link taken apart: its logical path and its anchor, for `localizePath`. */
function partsOf(link: string): { path: string; anchor: string | undefined } {
  const [path = '', anchor] = link.split('#');
  return { path: stripLocale(path), anchor };
}

/** The two-link mark between two pieces; the chain stacks below `@3xl`, and the mark goes. */
export function ChainLink() {
  return (
    <li className="hidden w-10 shrink-0 items-center @3xl:flex" aria-hidden="true">
      <svg viewBox="0 0 40 20" className="w-10">
        <rect x="2" y="5" width="20" height="10" rx="5" className="fill-none stroke-primary" strokeWidth="2" />
        <rect x="18" y="5" width="20" height="10" rx="5" className="fill-none stroke-border" strokeWidth="2" />
      </svg>
    </li>
  );
}

/**
 * The jump over the AI agent piece: a dashed arc from the terminal piece to the folder piece, its pill on top. Below
 * `@3xl` the pieces stack, the arc goes and the pill sits in the flow above them.
 */
export function SkipArc({ label, link, locale }: { label: string } & SlideLink) {
  const to = partsOf(link);
  return (
    <div className="relative mb-3 @3xl:mb-0 @3xl:h-20">
      <svg viewBox="0 0 1200 90" className="hidden h-20 w-full @3xl:block" aria-hidden="true">
        <path
          d="M150 84 C 230 6, 670 6, 750 80"
          className="fill-none stroke-primary"
          strokeWidth="2.5"
          strokeDasharray="7 7"
        />
        <path
          d="M738 68 L751 82 L760 64"
          className="fill-none stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <a
        data-skip="agent"
        href={localizePath(to.path, locale, to.anchor)}
        className="card-hover card-hover--raise inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-caption font-semibold text-pretty text-primary-foreground @3xl:absolute @3xl:top-0 @3xl:left-3/8 @3xl:-translate-x-1/2 @3xl:whitespace-nowrap"
      >
        {label}
      </a>
    </div>
  );
}

interface SideRouteProps extends SlideLink {
  readonly n: number;
  readonly section: string;
  readonly title: string;
  readonly lead: string;
  readonly action: string;
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M5 12h13M13 6l6 6-6 6"
        className="fill-none stroke-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The technical route as a dashed side road off the chain: step 8, its Section and the jump to it. */
export function SideRoute({ n, section, title, lead, action, link, locale }: SideRouteProps) {
  const to = partsOf(link);
  return (
    <a
      data-skip="technical"
      href={localizePath(to.path, locale, to.anchor)}
      className="card-hover card-hover--outline flex items-center gap-5 rounded-2xl border border-dashed border-border bg-card px-6 py-5 @3xl:col-span-8"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-border text-caption text-muted-foreground">
        {n}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-caption tracking-wide text-muted-foreground uppercase">{section}</span>
          <span className="text-body">{title}</span>
        </span>
        <span className="inline-flex w-fit flex-wrap items-center gap-2 rounded-full border border-border px-4 py-1.5 text-caption">
          <span className="text-muted-foreground">{lead}</span>
          <b className="font-semibold">{action}</b>
          <Arrow />
        </span>
      </span>
    </a>
  );
}
