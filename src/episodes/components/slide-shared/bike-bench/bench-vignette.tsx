import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { Bike, Colleague, LINE, Screw, Sheet, Wrenches } from './vignette-parts';

/** The four messes set up before the shift, then the four arriving during it, in the rot grid's column order. */
export const MESS_IDS = [
  'wrong-screw',
  'binder',
  'wrenches',
  'two-sheets',
  'mislabelled-box',
  'colleagues',
  'crates',
  'rush-vs-check',
] as const;

/** The cleaned-up state of each static mess, in the same column order. */
export const CLEAN_IDS = ['checked-sheet', 'one-page', 'three-wrenches', 'one-sheet'] as const;

export type MessId = (typeof MESS_IDS)[number];
export type CleanId = (typeof CLEAN_IDS)[number];
export type VignetteId = MessId | CleanId;

const SPARK = 'M118 70 l10 -14 l-4 12 h10 l-12 16 l4 -12 z';

const DRAWINGS: Record<VignetteId, ReactNode> = {
  'wrong-screw': (
    <>
      <Sheet x={40} y={10} tone="machine" mark={62} />
      <rect x={46} y={63} width={86} height={18} rx={9} className="fill-none stroke-(--warning)" strokeWidth={3} />
      <Screw x={178} y={40} />
      <circle cx={190} cy={104} r={12} className="fill-none stroke-foreground" strokeWidth={4} />
    </>
  ),
  binder: (
    <>
      {[0, 1, 2, 3, 4, 5, 6].map((step) => (
        <rect
          key={step}
          x={30 + 4 * step}
          y={20 + 3 * step}
          width={110}
          height={104}
          rx={6}
          className="fill-card stroke-(--warning)/70"
          strokeWidth={2}
        />
      ))}
      <rect x={30} y={20} width={18} height={104} rx={4} className="fill-(--warning)/30" />
      <Bike x={185} y={98} r={16} />
    </>
  ),
  wrenches: <Wrenches xs={[36, 50, 64, 78, 92, 106, 120, 134, 148, 162, 176, 190, 204]} tone="warning" />,
  'two-sheets': (
    <>
      <Sheet x={30} y={14} tone="muted" />
      <Sheet x={110} y={6} tone="machine" />
      <path d={SPARK} className="fill-(--warning) stroke-(--warning)" strokeWidth={2} />
    </>
  ),
  'mislabelled-box': (
    <>
      <rect x={40} y={44} width={120} height={84} rx={6} className="fill-machine/15 stroke-machine" strokeWidth={3} />
      <path d="M40 44 l20 -26 h120 l-20 26" className="fill-machine/10 stroke-machine" strokeWidth={3} {...LINE} />
      <rect x={62} y={70} width={76} height={32} rx={4} className="fill-card stroke-(--warning)" strokeWidth={3} />
      <line x1={72} y1={86} x2={126} y2={86} className="stroke-(--warning)" strokeWidth={5} {...LINE} />
      <Screw x={188} y={50} />
    </>
  ),
  colleagues: (
    <>
      <Colleague x={50} bubbleY={14} />
      <Colleague x={120} bubbleY={22} />
      <Colleague x={190} bubbleY={30} />
    </>
  ),
  crates: (
    <>
      {[30, 82].flatMap((y) =>
        [14, 58, 102, 146, 190].map((x) => (
          <g key={`${x}-${y}`}>
            <rect
              x={x}
              y={y}
              width={38}
              height={40}
              rx={3}
              className="fill-machine/15 stroke-(--warning)/80"
              strokeWidth={2.5}
            />
            <line x1={x} y1={y + 14} x2={x + 38} y2={y + 14} className="stroke-(--warning)/50" strokeWidth={2} />
            <circle cx={x + 12} cy={y - 2} r={5} className="fill-machine/40" />
            <circle cx={x + 26} cy={y - 2} r={5} className="fill-machine/40" />
          </g>
        )),
      )}
    </>
  ),
  'rush-vs-check': (
    <>
      <path
        d="M14 26 h86 a8 8 0 0 1 8 8 v34 a8 8 0 0 1 -8 8 h-50 l-16 14 v-14 h-20 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8 z"
        className="fill-(--warning)/20 stroke-(--warning)"
        strokeWidth={3}
      />
      <path d="M30 46 h52 M30 58 h30" className="stroke-(--warning)" strokeWidth={5} {...LINE} />
      <path
        d="M140 56 h86 a8 8 0 0 1 8 8 v34 a8 8 0 0 1 -8 8 h-20 v14 l-16 -14 h-50 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8 z"
        className="fill-card stroke-machine"
        strokeWidth={3}
      />
      <path d="M156 76 h52 M156 88 h30" className="stroke-machine/50" strokeWidth={5} {...LINE} />
      <path d="M114 64 l10 -12 l-3 10 h8 l-10 14 l3 -10 z" className="fill-(--warning)" />
    </>
  ),
  'checked-sheet': (
    <>
      <Sheet x={28} y={6} tone="machine" />
      <circle cx={128} cy={116} r={16} className="fill-primary" />
      <path d="M121 116 l5 5 l9 -10" className="fill-none stroke-primary-foreground" strokeWidth={3.5} {...LINE} />
      <Bike x={170} y={100} r={22} base={48} />
    </>
  ),
  'one-page': (
    <>
      <rect
        x={22}
        y={30}
        width={62}
        height={88}
        rx={4}
        className="fill-muted stroke-muted-foreground/50"
        strokeWidth={2}
      />
      <rect
        x={28}
        y={24}
        width={62}
        height={88}
        rx={4}
        className="fill-muted stroke-muted-foreground/50"
        strokeWidth={2}
      />
      <path d="M104 72 h36 m-10 -10 l10 10 l-10 10" className="fill-none stroke-primary" strokeWidth={4} {...LINE} />
      <Sheet x={140} y={14} tone="machine" />
    </>
  ),
  'three-wrenches': <Wrenches xs={[36, 120, 204]} tone="foreground" />,
  'one-sheet': (
    <>
      <g transform="rotate(-18 70 110)">
        <Sheet x={24} y={30} tone="muted" />
      </g>
      <path d="M36 128 h80" className="stroke-muted-foreground/50" strokeWidth={3} strokeDasharray="6 6" />
      <Sheet x={120} y={6} tone="machine" />
    </>
  ),
};

/**
 * One small scene cropped from the bike bench, 240 by 140: a mess, its trouble in `warning` and the rest `machine`
 * and `foreground`, or the clean state a fix leaves, with no `warning` in it. A server SVG; shared because the rot
 * grid and the cleanup Slide both draw the messes (FE-007).
 */
export function BenchVignette({ id, label, className }: { id: VignetteId; label: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 240 140"
      className={cn('h-auto w-full', className)}
      role="img"
      aria-label={label}
      data-vignette={id}
    >
      {DRAWINGS[id]}
    </svg>
  );
}
