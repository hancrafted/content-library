import { PAPER_PILE_ORIGIN } from '@/lib/paper-pile.pure';

function LightMaterials() {
  return (
    <>
      <linearGradient id="hero-sky" x2="0" y2="1">
        <stop stopColor="var(--hero-sky-top)" />
        <stop offset="1" stopColor="var(--hero-sky-bottom)" />
      </linearGradient>
      <linearGradient id="hero-light-pool" x2="0" y2="1">
        <stop stopColor="var(--hero-light)" stopOpacity=".5" />
        <stop offset="1" stopColor="var(--hero-light)" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="hero-glow">
        <stop stopColor="var(--hero-light)" stopOpacity=".75" />
        <stop offset="1" stopColor="var(--hero-light)" stopOpacity="0" />
      </radialGradient>
      <filter id="hero-soft-shadow" x="-.3" y="-.8" width="1.6" height="2.6">
        <feGaussianBlur stdDeviation="12" />
      </filter>
      <filter id="hero-blur" x="-.5" y="-.5" width="2" height="2">
        <feGaussianBlur stdDeviation="28" />
      </filter>
    </>
  );
}

function DeskMaterials() {
  return (
    <defs>
      <LightMaterials />
      <linearGradient id="hero-marble" x2=".18" y2="1">
        <stop stopColor="var(--hero-desk-back)" />
        <stop offset="1" stopColor="var(--hero-desk-front)" />
      </linearGradient>
      <linearGradient id="hero-metal" x2=".3" y2="1">
        <stop stopColor="var(--hero-metal-light)" />
        <stop offset=".48" stopColor="var(--hero-metal)" />
        <stop offset="1" stopColor="var(--hero-metal-dark)" />
      </linearGradient>
      <linearGradient id="hero-paper" x2="0" y2="1">
        <stop stopColor="var(--hero-paper)" />
        <stop offset="1" stopColor="var(--hero-paper-edge)" />
      </linearGradient>
    </defs>
  );
}

/** The window sits where the pile grows, so clearing the workload reveals the outside. */
function Window() {
  return (
    <g data-office-window>
      <rect x="1010" y="130" width="420" height="340" rx="6" fill="url(#hero-sky)" />
      <g data-sky-day>
        <circle cx="1300" cy="235" r="120" fill="url(#hero-glow)" />
        <circle cx="1300" cy="235" r="44" fill="var(--hero-sun)" />
      </g>
      <g data-sky-night>
        <circle cx="1300" cy="235" r="110" fill="url(#hero-glow)" opacity=".5" />
        <circle cx="1300" cy="235" r="40" fill="var(--hero-moon)" />
        <circle cx="1321" cy="222" r="36" fill="var(--hero-sky-top)" />
        <circle cx="1090" cy="180" r="2" fill="var(--hero-moon)" />
        <circle cx="1160" cy="300" r="1.6" fill="var(--hero-moon)" />
        <circle cx="1400" cy="170" r="2" fill="var(--hero-moon)" />
      </g>
      <path d="M1010 460q210-130 420 0V470H1010Z" fill="var(--hero-skyline)" />
      <path d="M1220 130v340M1010 310h420" stroke="var(--hero-window-frame)" strokeWidth="14" strokeLinecap="round" />
      <rect x="1002" y="122" width="436" height="356" rx="10" stroke="var(--hero-window-frame)" strokeWidth="16" />
      <rect x="980" y="470" width="480" height="18" rx="3" fill="var(--hero-window-sill)" />
    </g>
  );
}

function Pen() {
  return (
    <g transform="translate(437 752) rotate(-24)">
      <path d="M-4 15q90 7 182 2" stroke="var(--hero-shadow)" strokeWidth="14" strokeLinecap="round" opacity=".16" />
      <rect x="0" y="0" width="176" height="16" rx="8" fill="var(--hero-pen)" />
      <rect x="0" y="0" width="176" height="7" rx="3.5" fill="var(--hero-pen-light)" opacity=".45" />
      <rect x="52" y="-1" width="6" height="18" rx="2" fill="var(--hero-brass)" />
      <path d="M8 5h40" stroke="var(--hero-brass)" strokeWidth="3" strokeLinecap="round" />
      <path d="M176 2q12 2 20 6-8 4-20 6Z" fill="var(--hero-brass)" />
      <path d="m192 7 5 1-5 1Z" fill="var(--hero-metal-dark)" />
    </g>
  );
}

function Clipboard() {
  return (
    <g transform="translate(165 711) rotate(-12)">
      <path d="M-2 10h242l40 112H30Z" fill="var(--hero-shadow)" opacity=".18" filter="url(#hero-soft-shadow)" />
      <path d="M4 0h230q6 0 8 6l36 103q2 6-5 6H34q-6 0-8-6L0 6q-2-6 4-6Z" fill="var(--hero-board)" />
      <path d="M11 9h218l31 96H42Z" fill="url(#hero-paper)" />
      <path d="m48 32 128 1m-122 20 134 1m-128 20 134 1" stroke="var(--hero-paper-rule)" strokeWidth="2" />
      <rect x="92" y="-14" width="78" height="30" rx="7" fill="url(#hero-metal)" />
      <rect x="104" y="-6" width="54" height="10" rx="5" fill="var(--hero-metal-dark)" />
      <path d="M110-14v-10q21-14 42 0v10" stroke="var(--hero-metal-light)" strokeWidth="3" fill="none" />
    </g>
  );
}

function Stationery() {
  return (
    <g data-office-props>
      <Clipboard />
      <Pen />
    </g>
  );
}

function Desk() {
  return (
    <>
      <path d="M0 528h1600v372H0Z" fill="url(#hero-marble)" />
      <g stroke="var(--hero-vein)" fill="none" strokeLinecap="round" opacity=".4">
        <path d="M120 528q180 90 340 140t240 232M0 640q200 20 300 110t230 150" strokeWidth="2.2" />
        <path d="M700 528q120 160 400 180t500 190M1100 528q-60 110 60 190t240 182" strokeWidth="1.4" />
        <path d="M60 560q90 60 250 120M880 700q160 40 300 150M1380 528q-40 90 50 170" strokeWidth=".8" />
      </g>
      <path d="M0 528h1600" stroke="var(--hero-shadow)" strokeOpacity=".16" strokeWidth="5" />
    </>
  );
}

export function PromotionOffice() {
  const { x, y } = PAPER_PILE_ORIGIN;
  return (
    <>
      <DeskMaterials />
      <rect width="1600" height="900" fill="var(--hero-wall)" />
      <Window />
      <Desk />
      <path d="M1040 530h370l230 370H700Z" fill="url(#hero-light-pool)" filter="url(#hero-blur)" />
      <g data-pile-shadow transform={`translate(${x - 10} ${y + 160})`}>
        <path d="M0 0h395l-250 130H-160Z" fill="var(--hero-shadow)" opacity=".3" filter="url(#hero-soft-shadow)" />
      </g>
      <Stationery />
    </>
  );
}

export function PaperTray({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-8-35Q-12-45 0-45h260q10 0 18 10l105 119q9 11-3 17H85Z" fill="var(--hero-metal-dark)" />
      <path d="M0-6h261l101 115H88Z" fill="var(--hero-tray-inner)" />
      <path
        d="M-8-35Q-12-45 0-45h260q10 0 18 10l105 119"
        stroke="var(--hero-metal-light)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

export function PaperTrayFront({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-8-35 85 79v60q-8 3-15-7L-8 29q-4-5-4-15v-44Z" fill="url(#hero-metal)" />
      <path d="M-8-35 85 79" stroke="var(--hero-metal-light)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M85 79h72q14 0 20 11 5 10 22 10h60q17 0 23-10 6-11 20-11h72q15 0 15 12v42q0 12-14 12H98q-13 0-13-12Z"
        fill="url(#hero-metal)"
      />
      <path
        d="M85 79h72q14 0 20 11 5 10 22 10h60q17 0 23-10 6-11 20-11h72"
        stroke="var(--hero-metal-light)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M108 135h250" stroke="var(--hero-metal-dark)" strokeOpacity=".5" />
    </g>
  );
}
