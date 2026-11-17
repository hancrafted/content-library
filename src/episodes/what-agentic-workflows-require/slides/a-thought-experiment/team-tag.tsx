export function TeamTag({ x, y, width, label }: { x: number; y: number; width: number; label: string }) {
  return (
    <g data-team-tag>
      <rect x={x} y={y} width={width} height={20} rx={10} className="fill-foreground" />
      <text x={x + width / 2} y={y + 15} textAnchor="middle" className="fill-background text-caption font-semibold">
        {label}
      </text>
    </g>
  );
}
