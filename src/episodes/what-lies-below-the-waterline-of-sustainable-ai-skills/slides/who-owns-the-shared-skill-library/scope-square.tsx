import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import styles from './slide.module.css';

/** The matrix's four squares, row by row: personal on top, shared below; project-specific left, general right. */
const SQUARES = ['personal-project', 'personal-general', 'shared-project', 'shared-general'] as const;
const FOCAL = 'shared-general';
/** How much care the shared, general square asks for, of four. */
const CARE = 4;

/** The 2×2 locator: where the zoomed square sits on Slide 18's matrix, the other three dimmed. */
function Locator({ label }: { readonly label: string }) {
  return (
    <span role="img" aria-label={label} className="grid size-8 shrink-0 grid-cols-2 gap-0.5">
      {SQUARES.map((square) => (
        <span
          key={square}
          data-square={square}
          data-focal={square === FOCAL ? '' : undefined}
          className={cn('rounded-xs', square === FOCAL ? 'bg-foreground' : 'bg-foreground/35')}
        />
      ))}
    </span>
  );
}

/** The square's picture: the fleet manual afloat, low-poly, its pill naming it in either view. */
function FleetManual({ pill }: { readonly pill: { readonly chat: string; readonly coding: string } }) {
  return (
    <div className="relative overflow-hidden rounded-md">
      <svg viewBox="0 0 220 90" aria-hidden className={cn(styles.picture, 'block h-auto w-full')}>
        <rect data-tone="sky" x={0} y={0} width={220} height={52} />
        <polygon data-tone="sea-lit" points="0,52 220,52 220,90 0,90" />
        <polygon data-tone="sea" points="90,52 220,52 220,90 140,90" />
        <polygon data-tone="book-shade" points="40,20 106,14 110,72 44,78" />
        <polygon data-tone="book" points="36,22 100,16 104,70 40,76" />
        <polygon data-tone="paper" points="46,30 94,26 96,40 48,44" />
        <polygon data-tone="hull" points="132,48 206,48 196,62 140,62" />
        <polygon data-tone="house" points="150,36 182,36 182,48 150,48" />
      </svg>
      <span className="absolute right-1.5 bottom-1.5 rounded-full bg-card-foreground px-2 text-caption text-card">
        <InView view="chat">{pill.chat}</InView>
        <InView view="coding" className="font-mono">
          {pill.coding}
        </InView>
      </span>
    </div>
  );
}

export interface ScopeSquareProps {
  readonly back: string;
  readonly locator: string;
  readonly axes: { readonly shared: string; readonly general: string };
  readonly care: string;
  readonly chat: { readonly title: string; readonly sub: string };
  readonly coding: { readonly title: string; readonly sub: string };
  readonly pill: { readonly chat: string; readonly coding: string };
  readonly className?: string;
}

/** The square's words: its axes, its care dots, and its line in either view. */
function SquareWords({ axes, care, chat, coding }: Pick<ScopeSquareProps, 'axes' | 'care' | 'chat' | 'coding'>) {
  return (
    <>
      <p className="flex flex-wrap justify-between gap-x-3 text-caption text-muted-foreground">
        <span>{axes.shared}</span>
        <span>{axes.general}</span>
      </p>
      <p className="flex items-center justify-end gap-1 text-caption text-muted-foreground">
        {care}
        <span aria-hidden className="tracking-widest text-foreground">
          {'●'.repeat(CARE)}
        </span>
      </p>
      {(
        [
          ['chat', chat],
          ['coding', coding],
        ] as const
      ).map(([view, words]) => (
        <InView key={view} view={view} as="div" className="flex flex-col gap-0.5">
          <p className="text-caption font-semibold">{words.title}</p>
          <p className="text-caption text-muted-foreground">{words.sub}</p>
        </InView>
      ))}
    </>
  );
}

/**
 * The callback to Slide 18's skill scope matrix, cropped onto its shared, general square with a 2×2 locator: the
 * square's own words, its care dots and its picture, ringed as the focal square. Drawn in this Slide's folder until
 * Slide 18's matrix moves to `slide-shared/`, so this callback can render that part instead.
 */
export function ScopeSquare({ back, locator, pill, className, ...words }: ScopeSquareProps) {
  return (
    <div data-matrix className={cn('flex flex-col gap-3', className)}>
      <p className="flex items-center gap-3 text-caption">
        <Locator label={locator} />
        <span>{back}</span>
      </p>
      <ZoneCard
        data-zoomed={FOCAL}
        className="flex flex-col gap-2 rounded-xl p-3 shadow-md ring-2 ring-card-foreground"
      >
        <SquareWords {...words} />
        <FleetManual pill={pill} />
      </ZoneCard>
    </div>
  );
}
