export type PairSlug = 'handoff' | 'onboard' | 'chunks';

const WINDOW = {
  x: 4,
  y: 4,
  width: 112,
  height: 72,
  rx: 6,
  className: 'fill-card stroke-ai',
  strokeWidth: 2.5,
} as const;
const CHUNK = {
  y: 20,
  width: 30,
  height: 40,
  rx: 2,
  className: 'fill-human/20 stroke-human',
  strokeWidth: 2.5,
} as const;
const TASK = { y: 18, width: 32, height: 40, rx: 5, className: 'fill-card stroke-ai', strokeWidth: 2.5 } as const;

function Person({ x, y }: { x: number; y: number }) {
  return (
    <g className="fill-foreground/70">
      <circle cx={x} cy={y} r="5" />
      <path d={`M${x - 7} ${y + 22} v-9 a7 7 0 0 1 14 0 v9 z`} />
    </g>
  );
}

/** A chat window with its title bar. */
function ChatWindow() {
  return (
    <>
      <rect {...WINDOW} />
      <path d="M4 16 H116" className="fill-none stroke-ai" strokeWidth="2" />
    </>
  );
}

const WORK = {
  handoff: () => (
    <>
      <Person x={22} y={22} />
      <Person x={98} y={22} />
      <rect x="46" y="30" width="28" height="22" rx="2" className="fill-card stroke-human" strokeWidth="2.5" />
      <path d="M46 36h28" className="fill-none stroke-human" strokeWidth="2" />
      <path d="M38 64 H84 M78 58 L86 64 L78 70" className="fill-none stroke-foreground/50" strokeWidth="2" />
    </>
  ),
  onboard: () => (
    <>
      <Person x={30} y={22} />
      <rect x="24" y="36" width="12" height="8" rx="1" className="fill-human" />
      <rect x="60" y="10" width="44" height="58" rx="3" className="fill-card stroke-human" strokeWidth="2.5" />
      <path d="M68 24 l3 3 6-6 M68 38 l3 3 6-6 M68 52 l3 3 6-6" className="fill-none stroke-human" strokeWidth="2" />
      <path d="M82 24h14M82 38h14M82 52h10" className="fill-none stroke-foreground/40" strokeWidth="2" />
    </>
  ),
  chunks: () => (
    <>
      <rect x="6" {...CHUNK} />
      <rect x="44" {...CHUNK} />
      <rect x="82" {...CHUNK} />
      <path d="M40 14 V66 M78 14 V66" className="fill-none stroke-foreground" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M60 74 H112" className="fill-none stroke-foreground/50" strokeWidth="2" />
      <path d="M112 66 V78 M112 66 h-8 l3 3 -3 3 h8" className="fill-none stroke-foreground/70" strokeWidth="2" />
    </>
  ),
} as const;

const AI = {
  handoff: () => (
    <>
      <ChatWindow />
      <rect x="12" y="24" width="26" height="34" rx="2" className="fill-ai/20 stroke-ai" strokeWidth="2" />
      <path d="M17 32h16M17 39h16M17 46h10" className="fill-none stroke-ai" strokeWidth="1.5" />
      <rect x="46" y="26" width="62" height="12" rx="6" className="fill-ai/20" />
      <rect x="46" y="62" width="62" height="8" rx="4" className="fill-none stroke-ai" strokeWidth="1.5" />
    </>
  ),
  onboard: () => (
    <>
      <ChatWindow />
      <path d="M60 30 v20 M50 40 h20" className="fill-none stroke-ai" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="18" y="58" width="84" height="10" rx="5" className="fill-ai/20" />
    </>
  ),
  chunks: () => (
    <>
      <rect x="4" {...TASK} />
      <rect x="44" {...TASK} />
      <rect x="84" {...TASK} />
      <path d="M36 38 H44 M76 38 H84" className="fill-none stroke-foreground" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M10 28h20M50 28h20M90 28h20" className="fill-none stroke-ai" strokeWidth="2" />
      <path d="M20 66 H100" className="fill-none stroke-foreground/50" strokeWidth="2" />
      <path d="M100 60 V74 M100 60 h-8 l3 3 -3 3 h8" className="fill-none stroke-foreground/70" strokeWidth="2" />
    </>
  ),
} as const;

/** The small drawing of one side of a pair: the moment at work, or its reflection with AI. */
export function PairArt({ slug, side }: { slug: PairSlug; side: 'work' | 'ai' }) {
  const Art = side === 'work' ? WORK[slug] : AI[slug];
  return (
    <div className="mx-auto w-2/3">
      <svg viewBox="0 0 120 80" className="w-full" aria-hidden="true">
        <Art />
      </svg>
    </div>
  );
}
