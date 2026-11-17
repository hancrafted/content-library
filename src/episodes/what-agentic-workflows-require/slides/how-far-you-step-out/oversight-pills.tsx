type Oversight = 'in' | 'on' | 'out';

const LEVELS: readonly Oversight[] = ['in', 'on', 'out'];
const WIDTH = 48;
const GAP = 8;

function Pill({ x, y, label, selected }: { x: number; y: number; label: string; selected: boolean }) {
  return (
    <g data-pill data-selected={selected || undefined}>
      <rect
        x={x}
        y={y}
        width={WIDTH}
        height={20}
        rx={10}
        className={selected ? 'fill-foreground' : 'fill-card stroke-foreground'}
        strokeWidth={selected ? undefined : 1.5}
      />
      <text
        x={x + WIDTH / 2}
        y={y + 15}
        textAnchor="middle"
        className={selected ? 'fill-background text-caption font-semibold' : 'fill-foreground text-caption font-medium'}
      >
        {label}
      </text>
    </g>
  );
}

export function OversightPills({
  cx,
  y,
  labels,
  selected,
}: {
  cx: number;
  y: number;
  labels: Readonly<Record<Oversight, string>>;
  selected: Oversight;
}) {
  const left = cx - (LEVELS.length * WIDTH + (LEVELS.length - 1) * GAP) / 2;
  return (
    <g data-oversight>
      {LEVELS.map((level, index) => (
        <Pill key={level} x={left + index * (WIDTH + GAP)} y={y} label={labels[level]} selected={level === selected} />
      ))}
    </g>
  );
}
