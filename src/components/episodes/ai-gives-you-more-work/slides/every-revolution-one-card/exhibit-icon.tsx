export type ExhibitSlug = 'farming' | 'steam' | 'computer' | 'ai';

const STROKE = { strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** The plough over a dashed furrow. */
function Plough() {
  return (
    <g className="fill-none stroke-machine" {...STROKE}>
      <path d="M12 58 L72 58 L96 26" />
      <path d="M96 26 L106 14 M96 26 L112 24" />
      <path d="M66 58 L58 70 L84 70 Z" />
      <path d="M6 76 Q60 68 116 76" strokeDasharray="4 5" />
    </g>
  );
}

/** A flywheel driven by a boiler with its chimney and smoke. */
function SteamEngine() {
  return (
    <g className="fill-none stroke-machine" {...STROKE}>
      <circle cx="84" cy="46" r="22" />
      <path d="M84 24v44M62 46h44M68 30l32 32M100 30L68 62" strokeWidth="1.5" />
      <rect x="10" y="40" width="34" height="18" rx="2" />
      <path d="M44 49 L84 46" />
      <rect x="18" y="14" width="9" height="26" />
      <circle cx="28" cy="8" r="4" />
      <circle cx="39" cy="5" r="3" />
    </g>
  );
}

/** A screen of text lines on its stand. */
function Computer() {
  return (
    <g className="fill-none stroke-machine" {...STROKE}>
      <rect x="24" y="6" width="72" height="46" rx="3" />
      <path d="M32 18h30M32 27h46M32 36h24" strokeWidth="2" />
      <path d="M52 52v8h16v-8M30 70h60" />
    </g>
  );
}

/** Two speech bubbles, a prompt and its answer, with a spark. */
function Ai() {
  return (
    <g className="fill-none stroke-ai" {...STROKE}>
      <path d="M22 10h62a7 7 0 0 1 7 7v22a7 7 0 0 1-7 7H44l-12 10V46H22a7 7 0 0 1-7-7V17a7 7 0 0 1 7-7z" />
      <path d="M28 22h44M28 32h30" strokeWidth="2" />
      <path d="M100 34h38a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6h-6v8l-10-8h-22a6 6 0 0 1-6-6V40a6 6 0 0 1 6-6z" />
      <path d="M128 6 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
    </g>
  );
}

const ICONS = { farming: Plough, steam: SteamEngine, computer: Computer, ai: Ai } as const;

/** The machine of an exhibit, drawn in its meaning colour: `machine` for the three revolutions, `ai` for AI. */
export function ExhibitIcon({ slug }: { slug: ExhibitSlug }) {
  const Icon = ICONS[slug];
  const lead = slug === 'ai';
  return (
    <svg
      viewBox={lead ? '0 0 160 80' : '0 0 120 80'}
      className={lead ? 'h-24 w-full' : 'h-16 w-full'}
      aria-hidden="true"
    >
      <Icon />
    </svg>
  );
}
