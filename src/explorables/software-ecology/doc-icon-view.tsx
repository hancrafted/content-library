// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
export interface DocIconProps {
  readonly quality: 'good' | 'bad';
  readonly mark?: 'warn';
  readonly ai?: boolean;
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
}

function Sheet({ ai }: { ai: boolean }) {
  return (
    <path
      d="M0 0h8l4 4v11H0z"
      strokeWidth={ai ? 1.6 : 1.1}
      strokeLinejoin="round"
      className={ai ? 'fill-ai/20 stroke-ai' : 'fill-card stroke-foreground/60'}
    />
  );
}

export function DocIcon({ quality, mark, ai = false, x, y, scale = 1 }: DocIconProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Sheet ai={ai} />
      {quality === 'bad' && <rect x="2.5" y="7.8" width="7" height="2.4" rx="1.2" className="fill-destructive" />}
      {mark === 'warn' && <path d="M6 2.5l3.5 6h-7z" className="fill-destructive" />}
      {ai && <circle cx="0" cy="0" r="2.2" className="fill-ai" />}
    </g>
  );
}
