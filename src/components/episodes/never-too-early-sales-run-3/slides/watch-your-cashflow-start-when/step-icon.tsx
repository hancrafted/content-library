/** Cash running down month by month to a zero dot. */
function CashRunDown() {
  return (
    <>
      <path d="M4 52 H116" className="stroke-border" strokeWidth="2" />
      <rect x="8" y="8" width="16" height="44" className="fill-(--step-cash)" />
      <rect x="30" y="20" width="16" height="32" className="fill-(--step-cash)" />
      <rect x="52" y="32" width="16" height="20" className="fill-(--step-cash)" />
      <rect x="74" y="44" width="16" height="8" className="fill-(--step-cash)" />
      <path
        d="M16 8 L38 20 L60 32 L82 44 L104 52"
        className="fill-none stroke-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="104" cy="52" r="5" className="fill-foreground" />
    </>
  );
}

/** A checklist of leads, the last one still to research. */
function Checklist() {
  return (
    <>
      <rect x="4" y="6" width="10" height="10" rx="2" className="fill-none stroke-foreground" strokeWidth="2" />
      <path d="M22 11 H96" className="stroke-foreground" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="4" y="23" width="10" height="10" rx="2" className="fill-none stroke-foreground" strokeWidth="2" />
      <path d="M22 28 H80" className="stroke-foreground" strokeWidth="2.5" strokeLinecap="round" />
      <rect
        x="4"
        y="40"
        width="10"
        height="10"
        rx="2"
        className="fill-none stroke-muted-foreground"
        strokeWidth="2"
        strokeDasharray="3 3"
      />
      <path
        d="M22 45 H64"
        className="stroke-muted-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
    </>
  );
}

/** A dashed call path from you to a prospect. */
function CallPath() {
  return (
    <>
      <circle cx="16" cy="28" r="10" className="fill-foreground" />
      <path
        d="M30 28 C 50 8, 70 8, 90 22"
        className="fill-none stroke-foreground"
        strokeWidth="2.5"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <path
        d="M84 14 L92 23 L80 26"
        className="fill-none stroke-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="94" y="18" width="22" height="22" rx="4" className="fill-card stroke-foreground" strokeWidth="2" />
    </>
  );
}

/** The pipeline's three stages, by their left edge. */
const STAGES = [4, 43, 82] as const;
/** The deal cards in the first two stages, by their top-left corner. */
const DEALS = [
  [10, 10],
  [10, 24],
  [10, 38],
  [49, 10],
  [49, 24],
] as const;

/** A three-stage pipeline thinning to one revenue card. */
function MiniPipeline() {
  return (
    <>
      {STAGES.map((x) => (
        <rect key={x} x={x} y="4" width="34" height="48" rx="3" className="fill-muted stroke-border" strokeWidth="2" />
      ))}
      {DEALS.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="22"
          height="10"
          className="fill-card stroke-foreground"
          strokeWidth="1.5"
        />
      ))}
      <rect
        x="88"
        y="10"
        width="22"
        height="10"
        className="fill-(--step-revenue) stroke-foreground"
        strokeWidth="1.5"
      />
    </>
  );
}

const DRAWINGS = { s1: CashRunDown, s2: Checklist, s3: CallPath, s4: MiniPipeline } as const;

/** A step's slug, the key of its drawing and of its words. */
export type StepSlug = keyof typeof DRAWINGS;

/** A small drawing of one step, by its slug. */
export function StepIcon({ slug }: { slug: StepSlug }) {
  const Drawing = DRAWINGS[slug];
  return (
    <svg viewBox="0 0 120 56" className="h-14 w-full" aria-hidden="true">
      <Drawing />
    </svg>
  );
}
