import type { ReactNode } from 'react';

const LINE = 16;

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

type NoteLook = 'card' | 'external' | 'fail' | 'outlined' | 'goal';

const LOOKS: Record<
  NoteLook,
  { card: string; text: string; shadow?: string; strokeWidth?: number; strokeDasharray?: string; mark?: 'fail' }
> = {
  card: { card: 'fill-card', text: 'fill-foreground', shadow: 'fill-foreground/10' },
  external: {
    card: 'fill-card stroke-muted-foreground',
    text: 'fill-foreground',
    strokeWidth: 1.5,
    strokeDasharray: '5 3',
  },
  fail: {
    card: 'fill-card stroke-destructive',
    text: 'fill-foreground',
    shadow: 'fill-foreground/10',
    strokeWidth: 2,
    mark: 'fail',
  },
  outlined: {
    card: 'fill-card stroke-primary',
    text: 'fill-foreground',
    shadow: 'fill-foreground/10',
    strokeWidth: 1.5,
  },
  goal: { card: 'fill-primary', text: 'fill-primary-foreground', shadow: 'fill-foreground/15' },
};

interface NoteProps {
  readonly box: Box;
  readonly lines: readonly string[];
  readonly look?: NoteLook;
  readonly tilt?: number;
  readonly ticked?: boolean;
  readonly badge?: ReactNode;
  readonly data?: Readonly<Record<`data-${string}`, string | true>>;
}

function Lines({ cx, cy, lines, className }: { cx: number; cy: number; lines: readonly string[]; className: string }) {
  const top = cy - ((lines.length - 1) * LINE) / 2 + 5;
  return (
    <text data-note-text textAnchor="middle" className={`${className} text-caption font-semibold`}>
      {lines.map((line, index) => (
        <tspan key={line} x={cx} y={top + index * LINE}>
          {index > 0 ? ` ${line}` : line}
        </tspan>
      ))}
    </text>
  );
}

function Delivered({ box }: { box: Box }) {
  return (
    <path
      d={`M${box.x + 4} ${box.y + 8} l2.5 2.5 l5 -5`}
      className="fill-none stroke-foreground"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Cross({ box }: { box: Box }) {
  const cx = box.x + box.width - 4;
  const cy = box.y - 2;
  return (
    <>
      <circle cx={cx} cy={cy} r={8} className="fill-destructive" />
      <path
        d={`M${cx - 3} ${cy - 3} l6 6 M${cx + 3} ${cy - 3} l-6 6`}
        className="fill-none stroke-destructive-foreground"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </>
  );
}

export function Note({ box, lines, look = 'card', tilt = 0, ticked = false, badge, data }: NoteProps) {
  const { x, y, width, height } = box;
  const { card, text, shadow, strokeWidth, strokeDasharray, mark } = LOOKS[look];
  return (
    <g data-mark={mark} transform={`rotate(${tilt} ${x + width / 2} ${y + height / 2})`} {...data}>
      {shadow && <rect x={x + 2} y={y + 3} width={width} height={height} rx={3} className={shadow} />}
      <rect {...box} rx={3} className={card} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
      <Lines cx={x + width / 2} cy={y + height / 2} lines={lines} className={text} />
      {ticked && <Delivered box={box} />}
      {mark && <Cross box={box} />}
      {badge}
    </g>
  );
}
