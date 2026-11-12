import { cn } from '@/shared/lib/utils';

/* The pieces the bench vignettes are drawn from, in the vignettes' 240 by 140 units. */

export const LINE = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** A sheet with a folded corner at (x, y), 100 wide and 120 tall, its title line and four text lines in `tone`. */
export function Sheet({ x, y, tone, mark }: { x: number; y: number; tone: 'machine' | 'muted'; mark?: number }) {
  const edge = tone === 'machine' ? 'stroke-machine' : 'stroke-muted-foreground';
  const faint = tone === 'machine' ? 'stroke-machine/40' : 'stroke-muted-foreground/40';
  const rows = [44, 62, 80, 98].map((dy, index) => ({ dy, x2: index % 2 === 0 ? 80 : 64 }));
  return (
    <>
      <path d={`M${x} ${y} h80 l20 20 v100 h-100 z`} className={cn('fill-card', edge)} strokeWidth={3} {...LINE} />
      <line x1={x + 14} y1={y + 22} x2={x + 60} y2={y + 22} className={edge} strokeWidth={6} {...LINE} />
      {rows.map(({ dy, x2 }) => (
        <line
          key={dy}
          x1={x + 14}
          y1={y + dy}
          x2={x + x2}
          y2={y + dy}
          className={dy === mark ? 'stroke-(--warning)' : faint}
          strokeWidth={5}
          {...LINE}
        />
      ))}
    </>
  );
}

/** A screw, upright, its head at (x, y). */
export function Screw({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width={24} height={8} rx={2} className="fill-(--warning)" />
      <path
        d={`M${x + 6} ${y + 8} v28 l6 8 l6 -8 v-28 z`}
        className="fill-(--warning)/40 stroke-(--warning)"
        strokeWidth={2}
      />
    </>
  );
}

/** A wall of wrenches, at each x, in `tone`. */
export function Wrenches({ xs, tone }: { xs: readonly number[]; tone: 'warning' | 'foreground' }) {
  const stroke = tone === 'warning' ? 'stroke-(--warning)' : 'stroke-foreground';
  return (
    <>
      <rect x={20} y={10} width={200} height={120} rx={8} className="fill-muted stroke-border" strokeWidth={2} />
      {xs.map((x) => (
        <g key={x}>
          <line x1={x} y1={40} x2={x} y2={114} className={stroke} strokeWidth={4} {...LINE} />
          <circle cx={x} cy={32} r={7} className={cn('fill-none', stroke)} strokeWidth={3} />
        </g>
      ))}
    </>
  );
}

/** A small bike, its back wheel at (x, y) with radius r; `base` sets the wheelbase, else it scales with r. */
export function Bike({ x, y, r, base }: { x: number; y: number; r: number; base?: number }) {
  const k = r / 16;
  const front = x + (base ?? 37 * k);
  return (
    <>
      <circle cx={x} cy={y} r={r} className="fill-none stroke-foreground" strokeWidth={3} />
      <circle cx={front} cy={y} r={r} className="fill-none stroke-foreground" strokeWidth={3} />
      <path
        d={`M${x} ${y} L${x + 13 * k} ${y - 22 * k} L${x + 31 * k} ${y - 22 * k} L${front} ${y} M${x + 13 * k} ${y - 22 * k} L${x + 19 * k} ${y} L${x} ${y}`}
        className="fill-none stroke-foreground"
        strokeWidth={3}
        {...LINE}
      />
    </>
  );
}

/** A colleague dropping by, their question bubble above them, at column x. */
export function Colleague({ x, bubbleY }: { x: number; bubbleY: number }) {
  return (
    <>
      <circle cx={x} cy={88} r={14} className="fill-muted-foreground/60" />
      <path d={`M${x - 24} 140 v-16 a24 24 0 0 1 48 0 v16 z`} className="fill-muted-foreground/60" />
      <path
        d={`M${x - 20} ${bubbleY} h40 a6 6 0 0 1 6 6 v18 a6 6 0 0 1 -6 6 h-24 l-10 8 v-8 h-6 a6 6 0 0 1 -6 -6 v-18 a6 6 0 0 1 6 -6 z`}
        className="fill-(--warning)/20 stroke-(--warning)"
        strokeWidth={2.5}
      />
      {[-8, 2, 12].map((dx) => (
        <circle key={dx} cx={x + dx} cy={bubbleY + 15} r={3} className="fill-(--warning)" />
      ))}
    </>
  );
}
