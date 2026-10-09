import { OfficeWindow } from '@/components/landing/promotion-window';

function ShadowMaterials() {
  return (
    <>
      <filter id="hero-soft-shadow" x="-.3" y="-.8" width="1.6" height="2.6">
        <feGaussianBlur stdDeviation="12" />
      </filter>
    </>
  );
}

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
      <ShadowMaterials />
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

function Stationery() {
  return (
    <g data-office-props>
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
  return (
    <>
      <DeskMaterials />
      <rect width="1600" height="900" fill="var(--hero-wall)" />
      <OfficeWindow />
      <Desk />
      <path d="M1040 530h370l230 370H700Z" fill="url(#hero-light-pool)" filter="url(#hero-blur)" />
      <Stationery />
    </>
  );
}

/** The tray's solid parts in tray coordinates, shared with the shadow that must leave them unshaded. */
export const TRAY_OUTLINE = {
  back: 'M-8-35Q-12-45 0-45h260q10 0 18 10l105 119q9 11-3 17H85Z',
  wall: 'M-8-35 85 79v60q-8 3-15-7L-8 29q-4-5-4-15v-44Z',
  front: 'M85 79h72q14 0 20 11 5 10 22 10h60q17 0 23-10 6-11 20-11h72q15 0 15 12v42q0 12-14 12H98q-13 0-13-12Z',
};

export function PaperTray({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={TRAY_OUTLINE.back} fill="var(--hero-metal-dark)" />
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
      <path d={TRAY_OUTLINE.wall} fill="url(#hero-metal)" />
      <path d="M-8-35 85 79" stroke="var(--hero-metal-light)" strokeWidth="3" strokeLinecap="round" />
      <path d={TRAY_OUTLINE.front} fill="url(#hero-metal)" />
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
