import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** What is set up on the bench before the shift. */
const BEFORE = ['tool-wall', 'instruction-sheet', 'work-order', 'parts-box', 'bench', 'bike'] as const;
/** What lands on the bench during the shift. */
const DURING = ['folder', 'belt', 'note', 'phone', 'crate'] as const;

/** One thing the bench draws, by name, so a Slide can light it. */
export type BenchItem = (typeof BEFORE)[number] | (typeof DURING)[number];

export interface BikeBenchProps {
  /** The drawing's accessible name. */
  readonly label: string;
  /** Draws what lands during the shift: the folder, the belt with its boxes, the note, the phone and the crate. */
  readonly arrivals?: boolean;
  /** `human-and-ai` stands the person in front of the bench, handing the AI worker beside them a part. */
  readonly worker?: 'none' | 'human-and-ai';
  /** Items drawn at full strength while every other item dims; none given, nothing dims. */
  readonly highlight?: readonly BenchItem[];
  /** Extra SVG a Slide draws over the bench, in the drawing's 1000 by 440 units. */
  readonly layer?: ReactNode;
  readonly className?: string;
}

const LINE = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** A sheet line, the stroke a document's text is drawn with. */
function Rule({ x1, x2, y, strong = false }: { x1: number; x2: number; y: number; strong?: boolean }) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      className={strong ? 'stroke-machine' : 'stroke-machine/40'}
      strokeWidth={strong ? 7 : 5}
      {...LINE}
    />
  );
}

const DRAWINGS: Record<BenchItem, ReactNode> = {
  'tool-wall': (
    <>
      <rect x={40} y={40} width={250} height={170} rx={10} className="fill-muted stroke-border" strokeWidth={3} />
      {[70, 133, 197, 260].map((x) => (
        <g key={x}>
          <line x1={x} y1={83} x2={x} y2={182} className="stroke-foreground" strokeWidth={7} {...LINE} />
          <circle cx={x} cy={72} r={11} className="fill-none stroke-foreground" strokeWidth={5} />
        </g>
      ))}
    </>
  ),
  'instruction-sheet': (
    <>
      <path d="M320 40 h105 l25 25 v120 h-130 z" className="fill-card stroke-machine" strokeWidth={3} {...LINE} />
      <path d="M425 40 v25 h25" className="fill-none stroke-machine" strokeWidth={3} {...LINE} />
      <Rule x1={338} x2={400} y={66} strong />
      <Rule x1={338} x2={430} y={90} />
      <Rule x1={338} x2={406} y={112} />
      <Rule x1={338} x2={430} y={134} />
      <Rule x1={338} x2={406} y={156} />
      <circle cx={385} cy={48} r={6} className="fill-machine" />
    </>
  ),
  'work-order': (
    <>
      <rect x={470} y={40} width={150} height={64} rx={8} className="fill-card stroke-machine" strokeWidth={3} />
      <Rule x1={488} x2={600} y={62} strong />
      <Rule x1={488} x2={572} y={84} />
    </>
  ),
  'parts-box': (
    <>
      <rect x={190} y={196} width={64} height={64} rx={6} className="fill-card stroke-machine" strokeWidth={3} />
      <rect x={208} y={189} width={28} height={12} rx={3} className="fill-machine" />
      <Rule x1={202} x2={242} y={220} />
      <Rule x1={202} x2={232} y={238} />
    </>
  ),
  bench: (
    <>
      <rect x={30} y={260} width={940} height={22} rx={4} className="fill-foreground/75" />
      <rect x={60} y={282} width={16} height={138} className="fill-foreground/75" />
      <rect x={924} y={282} width={16} height={138} className="fill-foreground/75" />
      <rect x={110} y={282} width={180} height={56} className="fill-muted stroke-border" strokeWidth={3} />
      <line x1={180} y1={310} x2={220} y2={310} className="stroke-muted-foreground" strokeWidth={5} {...LINE} />
      <line x1={0} y1={420} x2={1000} y2={420} className="stroke-border" strokeWidth={3} />
    </>
  ),
  bike: (
    <g transform="translate(104 51) scale(0.8)">
      <circle cx={440} cy={214} r={42} className="fill-none stroke-foreground" strokeWidth={5} />
      <circle cx={600} cy={214} r={42} className="fill-none stroke-foreground" strokeWidth={5} />
      <circle cx={440} cy={214} r={4} className="fill-foreground" />
      <circle cx={600} cy={214} r={4} className="fill-foreground" />
      <path
        d="M440 214 L500 160 L585 160 L600 214 M500 160 L520 214 L440 214 M520 214 L585 160 M500 160 l-8 -16 h-16 M585 160 l6 -22 h18"
        className="fill-none stroke-foreground"
        strokeWidth={5}
        {...LINE}
      />
    </g>
  ),
  folder: (
    <path d="M664 222 h26 l8 8 h38 v30 h-72 z" className="fill-machine/15 stroke-machine" strokeWidth={3} {...LINE} />
  ),
  belt: (
    <>
      <rect x={752} y={226} width={260} height={12} rx={6} className="fill-muted-foreground" />
      {[772, 808, 844, 880, 916, 952, 988].map((cx) => (
        <circle key={cx} cx={cx} cy={232} r={3} className="fill-background" />
      ))}
      <rect x={780} y={186} width={54} height={40} rx={4} className="fill-machine/20 stroke-machine" strokeWidth={3} />
      <line x1={807} y1={186} x2={807} y2={226} className="stroke-machine/50" strokeWidth={3} />
      <rect x={862} y={174} width={66} height={52} rx={4} className="fill-machine/20 stroke-machine" strokeWidth={3} />
      <line x1={895} y1={174} x2={895} y2={226} className="stroke-machine/50" strokeWidth={3} />
    </>
  ),
  note: (
    <g transform="rotate(-4 835 92)">
      <rect x={790} y={52} width={90} height={80} rx={3} className="fill-card stroke-machine" strokeWidth={3} />
      <line x1={804} y1={78} x2={864} y2={78} className="stroke-machine/50" strokeWidth={5} {...LINE} />
      <line x1={804} y1={98} x2={850} y2={98} className="stroke-machine/50" strokeWidth={5} {...LINE} />
    </g>
  ),
  phone: (
    <>
      <rect x={912} y={52} width={48} height={74} rx={10} className="fill-card stroke-machine" strokeWidth={3} />
      <path d="M924 70 q12 -8 24 0 v6 h-6 v-3 q-6 -3 -12 0 v3 h-6 z" className="fill-machine" />
      <path d="M936 126 q-8 30 10 50" className="fill-none stroke-machine/50" strokeWidth={3} />
    </>
  ),
  crate: (
    <>
      {[815, 840, 868, 895].map((cx) => (
        <circle key={cx} cx={cx} cy={338} r={8} className="fill-machine/30 stroke-machine" strokeWidth={2} />
      ))}
      <rect x={790} y={340} width={130} height={80} rx={4} className="fill-machine/15 stroke-machine" strokeWidth={3} />
      <line x1={790} y1={366} x2={920} y2={366} className="stroke-machine/50" strokeWidth={3} />
      <line x1={790} y1={392} x2={920} y2={392} className="stroke-machine/50" strokeWidth={3} />
    </>
  ),
};

/** The person in `human`, holding a part, and the AI worker in `ai`, joined by the hand-over arc in `primary`. */
function Workers() {
  return (
    <>
      <g data-bench-worker="human">
        <circle cx={300} cy={236} r={32} className="fill-human" />
        <path d="M242 420 v-78 a58 58 0 0 1 116 0 v78 z" className="fill-human" />
        <rect x={320} y={318} width={56} height={40} rx={4} className="fill-card stroke-machine" strokeWidth={3} />
        <line x1={330} y1={332} x2={364} y2={332} className="stroke-machine/50" strokeWidth={4} {...LINE} />
      </g>
      <g data-bench-worker="ai">
        <circle cx={560} cy={236} r={32} className="fill-ai" />
        <path d="M502 420 v-78 a58 58 0 0 1 116 0 v78 z" className="fill-ai" />
        <path d="M600 196 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 z" className="fill-ai" />
      </g>
      <g data-bench-hand-over className="fill-none stroke-primary" strokeWidth={5} {...LINE}>
        <path d="M380 316 q70 -70 130 -6" strokeDasharray="10 8" />
        <path d="M498 296 l13 15 l4 -19" />
      </g>
    </>
  );
}

/**
 * The bike assembly bench, the reference drawing of "From shared understanding to shared context", seen from the
 * front: what was set up before the shift on its left (the tool wall, the pinned instruction sheet, the work order,
 * the parts box) and, with `arrivals`, what lands during it on its right (the folder, the belt with its boxes, a
 * colleague's note, the phone, the crate of parts). The objects are `machine`, what the AI reads. A server SVG with
 * one `data-bench-item` group per item; `highlight` lights some and dims the rest. Shared because Slides 9 to 12 draw
 * it, and Slides 6 and 13 reuse it (FE-007).
 */
export function BikeBench({ label, arrivals = false, worker = 'none', highlight, layer, className }: BikeBenchProps) {
  const items: readonly BenchItem[] = arrivals ? [...BEFORE, ...DURING] : BEFORE;
  const missing = highlight?.find((item) => !items.includes(item));
  if (missing !== undefined) throw new Error(`The bench does not draw "${missing}".`);
  const lit = (item: BenchItem) => highlight === undefined || highlight.includes(item);
  return (
    <svg viewBox="0 0 1000 440" className={cn('h-auto w-full', className)} role="img" aria-label={label}>
      {items.map((item) => (
        <g
          key={item}
          data-bench-item={item}
          data-lit={highlight !== undefined && lit(item) ? '' : undefined}
          data-dimmed={lit(item) ? undefined : ''}
          className={lit(item) ? undefined : 'opacity-30'}
        >
          {DRAWINGS[item]}
        </g>
      ))}
      {worker === 'human-and-ai' && <Workers />}
      {layer}
    </svg>
  );
}
