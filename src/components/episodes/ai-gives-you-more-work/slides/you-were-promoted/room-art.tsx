export type RoomSlug = 'execution' | 'management';

const SHEET = { className: 'fill-card stroke-foreground/50', strokeWidth: 2 } as const;
const TILE = { width: 32, height: 24, rx: 5, className: 'fill-card stroke-ai', strokeWidth: 2.5 } as const;

/** A person at a desk, a page in front of them and a stack of papers beside: doing the work yourself. */
function Execution() {
  return (
    <>
      <rect x="20" y="70" width="120" height="6" rx="2" className="fill-foreground/50" />
      <path d="M34 76v28M126 76v28" className="fill-none stroke-foreground/50" strokeWidth="3" />
      <g className="fill-foreground/70">
        <circle cx="80" cy="34" r="5" />
        <path d="M73 56 v-9 a7 7 0 0 1 14 0 v9 z" />
      </g>
      <rect x="96" y="40" width="26" height="30" rx="1" {...SHEET} />
      <rect x="100" y="34" width="26" height="30" rx="1" {...SHEET} />
      <rect x="104" y="28" width="26" height="30" rx="1" {...SHEET} />
      <rect x="30" y="44" width="34" height="26" rx="2" {...SHEET} />
      <path d="M36 52h22M36 58h16" className="fill-none stroke-foreground/40" strokeWidth="2" />
    </>
  );
}

/** A person over three AI tiles, each with its spark: managing the work. */
function Management() {
  return (
    <>
      <path d="M80 50 L30 86 M80 50 L80 90 M80 50 L130 86" className="fill-none stroke-ai" strokeWidth="2" />
      <g className="fill-foreground/80">
        <circle cx="80" cy="18" r="5" />
        <path d="M73 40 v-9 a7 7 0 0 1 14 0 v9 z" />
      </g>
      <rect x="14" y="80" {...TILE} />
      <rect x="64" y="84" {...TILE} />
      <rect x="114" y="80" {...TILE} />
      <path
        d="M30 86l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z M80 90l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z M130 86l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"
        className="fill-ai"
      />
    </>
  );
}

/** The picture in a room's frame. */
export function RoomArt({ slug }: { slug: RoomSlug }) {
  return (
    <svg viewBox="0 0 160 110" className="w-full" aria-hidden="true">
      {slug === 'execution' ? <Execution /> : <Management />}
    </svg>
  );
}
