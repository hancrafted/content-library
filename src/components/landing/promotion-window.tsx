// [x, y, size]: a sprinkle of distant stars, none brighter than the old single dot.
const STARS = [
  [1040, 160, 1.2],
  [1078, 212, 0.7],
  [1112, 148, 0.9],
  [1150, 190, 0.6],
  [1186, 262, 1],
  [1052, 276, 0.6],
  [1128, 334, 0.8],
  [1092, 370, 0.5],
  [1176, 352, 0.6],
  [1200, 150, 0.5],
  [1248, 168, 0.7],
  [1240, 282, 0.5],
  [1262, 350, 0.9],
  [1340, 330, 0.6],
  [1386, 300, 1.1],
  [1410, 206, 0.7],
  [1416, 370, 0.5],
  [1302, 372, 0.6],
  [1376, 156, 0.5],
  [1060, 420, 0.5],
  [1400, 430, 0.6],
] as const;

function Star({ x, y, size, index }: { x: number; y: number; size: number; index: number }) {
  const arm = size * 3.2;
  return (
    <g
      data-star
      data-star-twinkle={index % 3 === 0 ? '' : undefined}
      style={{ animationDelay: `${(index * 0.7) % 4}s` }}
      opacity={0.45 + size * 0.4}
    >
      <circle cx={x} cy={y} r={size * 2.2} fill="url(#hero-star-glow)" />
      <path
        d={`M${x - arm} ${y}h${arm * 2}M${x} ${y - arm}v${arm * 2}`}
        stroke="var(--hero-moon)"
        strokeWidth={size * 0.35}
        strokeLinecap="round"
      />
      <circle cx={x} cy={y} r={size * 0.55} fill="var(--hero-moon)" />
    </g>
  );
}

function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g data-cloud>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <ellipse cx="0" cy="2" rx="40" ry="13" fill="var(--hero-cloud-shade)" />
        <circle cx="-18" cy="-6" r="15" fill="var(--hero-cloud)" />
        <circle cx="4" cy="-14" r="20" fill="var(--hero-cloud)" />
        <circle cx="26" cy="-4" r="13" fill="var(--hero-cloud)" />
        <ellipse cx="2" cy="-2" rx="38" ry="10" fill="var(--hero-cloud)" />
      </g>
    </g>
  );
}

function SkyMaterials() {
  return (
    <defs>
      <clipPath id="hero-window-pane">
        <rect x="1010" y="130" width="420" height="340" rx="6" />
      </clipPath>
      <radialGradient id="hero-star-glow">
        <stop stopColor="var(--hero-moon)" stopOpacity=".45" />
        <stop offset="1" stopColor="var(--hero-moon)" stopOpacity="0" />
      </radialGradient>
      {/* One crescent shape, so the glow behind it never outlines a dark disc. */}
      <mask id="hero-moon-crescent">
        <circle cx="1300" cy="235" r="40" fill="#fff" />
        <circle cx="1321" cy="222" r="36" fill="#000" />
      </mask>
    </defs>
  );
}

function DaySky() {
  return (
    <g data-sky-day>
      <circle cx="1300" cy="235" r="120" fill="url(#hero-glow)" />
      <circle cx="1300" cy="235" r="44" fill="var(--hero-sun)" />
      <Cloud x={1090} y={196} scale={1} />
      <Cloud x={1340} y={250} scale={0.7} />
      <Cloud x={1300} y={385} scale={0.55} />
    </g>
  );
}

function NightSky() {
  return (
    <g data-sky-night>
      {STARS.map(([x, y, size], index) => (
        <Star key={`${x}-${y}`} x={x} y={y} size={size} index={index} />
      ))}
      <circle cx="1284" cy="245" r="100" fill="url(#hero-glow)" opacity=".45" />
      <g mask="url(#hero-moon-crescent)">
        <circle cx="1300" cy="235" r="40" fill="var(--hero-moon)" />
        <g fill="var(--hero-moon-shade)" opacity=".5">
          <circle cx="1282" cy="250" r="6" />
          <circle cx="1292" cy="264" r="4" />
          <circle cx="1270" cy="230" r="3.5" />
        </g>
      </g>
    </g>
  );
}

/** The window sits where the pile grows, so clearing the workload reveals the outside. */
export function OfficeWindow() {
  return (
    <g data-office-window>
      <SkyMaterials />
      <rect x="1010" y="130" width="420" height="340" rx="6" fill="url(#hero-sky)" />
      <g clipPath="url(#hero-window-pane)">
        <DaySky />
        <NightSky />
      </g>
      <path d="M1010 460q210-130 420 0V470H1010Z" fill="var(--hero-skyline)" />
      <path d="M1220 130v340M1010 310h420" stroke="var(--hero-window-frame)" strokeWidth="14" strokeLinecap="round" />
      <rect x="1002" y="122" width="436" height="356" rx="10" stroke="var(--hero-window-frame)" strokeWidth="16" />
      <rect x="980" y="470" width="480" height="18" rx="3" fill="var(--hero-window-sill)" />
    </g>
  );
}
