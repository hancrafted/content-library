import { cn } from '@/lib/utils';

function DecayDayZero() {
  return (
    <g>
      <line x1="160" y1="66" x2="160" y2="306" className="stroke-border" strokeWidth="1.5" />
      <rect x="118" y="44" width="84" height="21" rx="10.5" className="fill-card stroke-border" strokeWidth="1" />
      <text
        x="160"
        y="59"
        textAnchor="middle"
        className="fill-foreground font-mono text-[10.5px] font-bold uppercase tracking-wider"
      >
        Day zero
      </text>
    </g>
  );
}

function DecayAxesLabels() {
  return (
    <g className="font-mono uppercase">
      <text x="154" y="320" textAnchor="end" className="fill-muted-foreground text-[9.5px] tracking-[0.18em]">
        before it ships
      </text>
      <text x="166" y="320" className="fill-muted-foreground text-[9.5px] tracking-[0.18em]">
        after it ships
      </text>
      <text
        x="238"
        y="344"
        textAnchor="middle"
        className="fill-muted-foreground font-semibold text-[11px] tracking-widest"
      >
        life of one document
      </text>
    </g>
  );
}

function DecayAxes() {
  return (
    <g>
      <rect x="76" y="62" width="84" height="238" className="fill-muted/30" />
      <g className="text-muted-foreground/50">
        <line
          x1="76"
          y1="300"
          x2="76"
          y2="52"
          stroke="currentColor"
          strokeWidth="1.5"
          markerEnd="url(#decay-axis-arrow)"
        />
        <line x1="68" y1="300" x2="410" y2="300" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <text x="76" y="38" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-widest">
        Effort
      </text>
      <DecayDayZero />
      <DecayAxesLabels />
    </g>
  );
}

function DecayCurves() {
  return (
    <g>
      <path
        d="M 76 262 C 104 252, 130 200, 158 108 C 168 76, 196 74, 212 116 C 234 174, 258 214, 296 244 C 334 274, 368 285, 400 290"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-accent"
      />
      <path
        d="M 160 296 C 196 288, 228 264, 262 230 C 300 192, 342 146, 400 76"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-secondary"
      />
    </g>
  );
}

function DecayLegend() {
  return (
    <g>
      <line x1="408" y1="76" x2="424" y2="76" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
      <text x="432" y="73" className="fill-foreground text-[11px] font-semibold">
        Drift / staleness
      </text>
      <text x="432" y="88" className="fill-muted-foreground text-[11px]">
        never flattens
      </text>
      <line x1="408" y1="290" x2="424" y2="290" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
      <text x="432" y="287" className="fill-foreground text-[11px] font-semibold">
        Maintenance effort
      </text>
      <text x="432" y="302" className="fill-muted-foreground text-[11px]">
        decays to nothing
      </text>
    </g>
  );
}

function DecayCallout() {
  return (
    <g>
      <line x1="272" y1="122" x2="271" y2="209" className="stroke-secondary/50" strokeWidth="1" strokeDasharray="2 3" />
      <rect x="236" y="92" width="150" height="28" rx="9" className="fill-card stroke-secondary/50" strokeWidth="1" />
      <text
        x="311"
        y="110"
        textAnchor="middle"
        className="fill-secondary font-mono text-[10px] font-semibold tracking-wide"
      >
        where the work moved
      </text>
      <circle cx="271" cy="220" r="7" fill="none" className="stroke-secondary" strokeWidth="2" />
      <circle cx="271" cy="220" r="5" className="fill-secondary stroke-card" strokeWidth="2" />
    </g>
  );
}

function DecayCrossover() {
  return (
    <g>
      <DecayLegend />
      <DecayCallout />
    </g>
  );
}

export function EffortDecayChart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 360"
      role="img"
      aria-label="The life of a single document: maintenance effort decays while drift climbs."
      className={cn('mx-auto block h-auto max-h-[40vh] w-full', className)}
    >
      <defs>
        <marker
          id="decay-axis-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 2 L 7 5 L 1 8 z" fill="currentColor" className="text-muted-foreground/60" />
        </marker>
      </defs>
      <DecayAxes />
      <DecayCurves />
      <DecayCrossover />
    </svg>
  );
}
