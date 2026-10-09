function DeskMaterials() {
  return (
    <defs>
      <linearGradient id="hero-oak" x2=".18" y2="1">
        <stop stopColor="var(--hero-wood-back)" />
        <stop offset="1" stopColor="var(--hero-wood-front)" />
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
      <radialGradient id="hero-daylight">
        <stop stopColor="var(--hero-light)" stopOpacity=".55" />
        <stop offset="1" stopColor="var(--hero-light)" stopOpacity="0" />
      </radialGradient>
      <filter id="hero-soft-shadow" x="-.3" y="-.8" width="1.6" height="2.6">
        <feGaussianBlur stdDeviation="12" />
      </filter>
    </defs>
  );
}

function BinderClip() {
  return (
    <g transform="translate(607 781) rotate(12)">
      <path d="M0 0h32l6 25H6Z" fill="var(--hero-metal-dark)" />
      <path
        d="M8 0v-17q8-15 16 0V0m-12 24v14q8 15 16 0V24"
        stroke="var(--hero-metal-light)"
        strokeWidth="3"
        fill="none"
      />
    </g>
  );
}

function Stationery() {
  return (
    <g data-office-props>
      <ellipse
        cx="355"
        cy="760"
        rx="184"
        ry="24"
        fill="var(--hero-shadow)"
        opacity=".13"
        filter="url(#hero-soft-shadow)"
      />
      <g transform="translate(165 711) rotate(-12)">
        <path d="M0 0h238l38 115H31Z" fill="var(--hero-notebook)" />
        <path d="M8 4h225l31 99H37Z" fill="url(#hero-paper)" />
        <path d="m16 12 20 89m160-97 29 100" stroke="var(--hero-metal-dark)" strokeWidth="4" />
        <path d="m43 27 126 1m-120 20 132 1m-126 20 132 1" stroke="var(--hero-line)" opacity=".5" />
      </g>
      <g transform="translate(437 752) rotate(-24)">
        <path d="M0 3h174l18 5-18 5H0Z" fill="var(--hero-metal-dark)" />
        <path d="M0 3h57v10H0Z" fill="url(#hero-metal)" />
        <path d="m174 3 18 5-18 5Z" fill="var(--hero-brass)" />
        <path d="M9 2h44" stroke="var(--hero-brass)" strokeWidth="3" />
      </g>
      <BinderClip />
    </g>
  );
}

export function PromotionOffice() {
  return (
    <>
      <DeskMaterials />
      <rect width="1600" height="900" fill="var(--hero-wall)" />
      <ellipse cx="1250" cy="210" rx="650" ry="480" fill="url(#hero-daylight)" />
      <path d="M1310 0v460m95-460v460" stroke="var(--hero-window)" strokeWidth="18" opacity=".1" />
      <path d="M0 528h1600v372H0Z" fill="url(#hero-oak)" />
      <path d="M0 528h1600" stroke="var(--hero-shadow)" strokeOpacity=".18" strokeWidth="5" />
      <g stroke="var(--hero-grain)" fill="none" opacity=".17">
        <path d="M0 581q520-17 1600 6M0 660q630-18 1600 7M0 787q780-21 1600 8M0 875q720-16 1600 5" />
        <path d="M0 602q690 8 1600 0M0 710q500 13 1600 3M0 829q790 9 1600 3" strokeWidth="2" />
      </g>
      <Stationery />
    </>
  );
}

export function PaperTray({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse
        cx="181"
        cy="132"
        rx="212"
        ry="32"
        fill="var(--hero-shadow)"
        opacity=".22"
        filter="url(#hero-soft-shadow)"
      />
      <path d="M-8-35Q-12-45 0-45h260q10 0 18 10l105 119q9 11-3 17H85Z" fill="var(--hero-metal-dark)" />
      <path d="M0-6h261l101 115H88Z" fill="var(--hero-tray-inner)" />
      <path d="M-8-35 85 79v60q-8 3-15-7L-8 29q-4-5-4-15v-44Z" fill="url(#hero-metal)" />
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
