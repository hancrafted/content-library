/** What a document icon shows (design-ADR 0024 §15): its quality, a complaint or rework mark, and whether AI made it. */
export interface DocIconProps {
  readonly quality: 'good' | 'bad';
  /** A complaint or rework: a red warning. */
  readonly mark?: 'warn';
  /** AI-made: an orange border, a light orange fill and a dot. */
  readonly ai?: boolean;
  /** Top-left corner, in the parent SVG's units. */
  readonly x: number;
  readonly y: number;
  /** 1 is a document on a belt (12 wide); a document in work is drawn larger. */
  readonly scale?: number;
}

/** The sheet itself: plain, or orange with a thicker border when AI made it. */
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

/**
 * One document of the software ecology factory, as SVG inside the caller's `<svg>`: plain is good, a red minus marks
 * bad, a red warning marks a complaint or rework, and AI-made is orange; the marks combine. Server-rendered and
 * decorative, so the caller names the picture. The Explorable's DOM legend and the Title slide's preview share it.
 */
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
