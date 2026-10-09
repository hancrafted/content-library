import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';

export type VennEmphasis = 'establish' | 'machine' | 'human';

const VENN_LENS = 'M 413.8 102.3 A 215 215 0 0 0 413.8 397.7 A 175 175 0 0 0 413.8 102.3 Z';

function VennDefs({ emphasis }: { emphasis: VennEmphasis }) {
  return (
    <defs>
      <pattern
        id={`venn-hatch-${emphasis}`}
        width="10"
        height="10"
        patternTransform="rotate(45 0 0)"
        patternUnits="userSpaceOnUse"
      >
        <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2" className="text-accent/30" />
      </pattern>
    </defs>
  );
}

function MachineCircle({ isMachine, isHuman }: { isMachine: boolean; isHuman: boolean }) {
  return (
    <g className={cn('transition-opacity duration-500', isHuman ? 'opacity-30' : 'opacity-100')}>
      <circle
        cx="320"
        cy="250"
        r="175"
        strokeWidth="2"
        className={cn('fill-primary/10 stroke-primary/50', isMachine && 'fill-primary/20 stroke-primary stroke-[2.5]')}
      />
      <text
        x="248"
        y="215"
        textAnchor="middle"
        className="fill-primary font-mono text-[24px] font-bold uppercase tracking-[0.12em]"
      >
        machine
      </text>
      <text x="248" y="246" textAnchor="middle" className="fill-foreground/80 text-[14px]">
        deterministic
      </text>
      <text x="248" y="272" textAnchor="middle" className="fill-muted-foreground text-[13px]">
        cheap
      </text>
      <text x="248" y="296" textAnchor="middle" className="fill-muted-foreground text-[13px]">
        fast
      </text>
    </g>
  );
}

function HumanCircleText() {
  return (
    <>
      <text
        x="635"
        y="215"
        textAnchor="middle"
        className="fill-secondary font-mono text-[24px] font-bold uppercase tracking-[0.12em]"
      >
        human
      </text>
      <text x="635" y="246" textAnchor="middle" className="fill-foreground/80 text-[14px]">
        non-deterministic
      </text>
      <text x="635" y="272" textAnchor="middle" className="fill-muted-foreground text-[13px]">
        time consuming
      </text>
      <text x="635" y="296" textAnchor="middle" className="fill-muted-foreground text-[13px]">
        trust
      </text>
    </>
  );
}

function HumanCircle({ isHuman, isMachine }: { isHuman: boolean; isMachine: boolean }) {
  return (
    <g className={cn('transition-opacity duration-500', isMachine ? 'opacity-35' : 'opacity-100')}>
      <circle
        cx="570"
        cy="250"
        r="215"
        strokeWidth="2"
        className={cn(
          'fill-secondary/15 stroke-secondary/50',
          isHuman && 'fill-secondary/30 stroke-secondary stroke-[3]',
        )}
      />
      <HumanCircleText />
    </g>
  );
}

function AiLens({ isHuman, isMachine, emphasis }: { isHuman: boolean; isMachine: boolean; emphasis: VennEmphasis }) {
  return (
    <g className={cn('transition-opacity duration-500', isHuman ? 'opacity-30' : 'opacity-100')}>
      <path
        d={VENN_LENS}
        strokeWidth="2"
        strokeDasharray="5 7"
        fill={`url(#venn-hatch-${emphasis})`}
        className={cn('stroke-accent/80', isMachine && 'stroke-accent')}
      />
      <text
        x="425"
        y="215"
        textAnchor="middle"
        className="fill-accent font-mono text-[24px] font-extrabold uppercase tracking-[0.12em]"
      >
        AI
      </text>
      <text x="425" y="244" textAnchor="middle" className="fill-foreground/80 text-[12px]">
        non-deterministic
      </text>
      <text x="425" y="268" textAnchor="middle" className="fill-muted-foreground text-[11px]">
        AI judging
      </text>
      <text x="425" y="290" textAnchor="middle" className="fill-muted-foreground text-[11px]">
        token cost
      </text>
    </g>
  );
}

function SteerArrow() {
  return (
    <g>
      <path
        d="M 246 346 Q 322 316 390 330"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-primary"
      />
      <path d="M 400 331 L 385 334 L 387 323 Z" className="fill-primary" />
      <text
        x="318"
        y="308"
        textAnchor="middle"
        className="fill-primary font-mono text-[14px] font-semibold uppercase tracking-[0.12em]"
      >
        steer
      </text>
      <circle cx="372" cy="76" r="5" className="fill-accent animate-pulse" />
      <text x="386" y="82" className="fill-accent font-mono text-[14px] font-semibold uppercase tracking-[0.12em]">
        running
      </text>
      <path d="M 414 90 L 414 101" fill="none" strokeWidth="1.5" strokeDasharray="3 4" className="stroke-accent/60" />
    </g>
  );
}

function HypothesisFootnote() {
  return (
    <g>
      <path d="M 414 402 L 414 492" fill="none" strokeWidth="1.5" strokeDasharray="4 6" className="stroke-accent/60" />
      <text
        x="414"
        y="516"
        textAnchor="middle"
        className="fill-accent font-mono text-[14px] font-semibold tracking-[0.02em]"
      >
        the AI region is my hypothesis — still unsettled
      </text>
    </g>
  );
}

export function EffortVenn({
  emphasis = 'establish',
  className,
  ...target
}: Partial<TargetProps> & {
  emphasis?: VennEmphasis;
  className?: string;
}) {
  return (
    <div {...target} className={cn('relative flex flex-col items-center justify-center', className)}>
      <svg
        viewBox="115 15 700 540"
        role="img"
        aria-label="Venn diagram of three overlapping verification regions: Machine, AI, and Human."
        className="isolate mx-auto block h-auto max-h-[50vh] w-full max-w-3xl overflow-visible"
      >
        <VennDefs emphasis={emphasis} />
        <MachineCircle isMachine={emphasis === 'machine'} isHuman={emphasis === 'human'} />
        <HumanCircle isHuman={emphasis === 'human'} isMachine={emphasis === 'machine'} />
        <AiLens isHuman={emphasis === 'human'} isMachine={emphasis === 'machine'} emphasis={emphasis} />
        {emphasis === 'machine' && <SteerArrow />}
        {emphasis === 'establish' && <HypothesisFootnote />}
      </svg>
    </div>
  );
}
