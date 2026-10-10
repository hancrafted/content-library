import { FieldnoteReveal } from '@/components/landing/fieldnote-reveal.client';
import styles from '@/components/landing/fieldnote-sketch.module.css';
import type { CSSProperties, ReactNode } from 'react';

/** Motion vocabulary: `draw` traces a stroke, `pop` scales a mark in, `jitter` shakes friction, `fade` brings in context, `sweep` turns a hand. */
type Kind = 'draw' | 'pop' | 'jitter' | 'fade' | 'sweep';
/** What a wrapper does while its phase column is hovered (keyframes live with the case styles). */
type Micro = 'jitter' | 'nudge' | 'retick' | 'pulse' | 'bob' | 'tick';

/** `i` is the beat in the phase's story; each beat starts a little after the one before. */
function motionProps(kind: Kind, i: number, cls?: string) {
  return {
    className: cls ? `${styles[kind]} ${cls}` : styles[kind],
    style: { '--i': i } as CSSProperties,
    ...(kind === 'draw' ? { pathLength: 1 } : {}),
  };
}

/** Hover loops live on their own wrapper so they never touch the one-shot entrance animation on the child. */
function Micro({ kind, i = 0, children }: { kind: Micro; i?: number; children: ReactNode }) {
  return (
    <g data-micro={kind} style={{ '--i': i } as CSSProperties}>
      {children}
    </g>
  );
}

const accent = styles.accentStroke;
const fill = styles.paperFill;

function Paper({ x, y, i = 0, kind = 'pop' }: { x: number; y: number; i?: number; kind?: Kind }) {
  const body = (
    <g {...motionProps(kind, i)}>
      <rect width="32" height="40" rx="2" className={fill} />
      <path d="M8 12h16M8 20h16M8 28h9" />
    </g>
  );
  return <g transform={`translate(${x} ${y})`}>{kind === 'jitter' ? <Micro kind="jitter">{body}</Micro> : body}</g>;
}

function Factory({ x, y, i = 0 }: { x: number; y: number; i?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Micro kind="bob" i={i}>
        <g {...motionProps('pop', i)}>
          <path d="M0 28V12l12-8v8l12-8v8h10v28H0ZM27 12V0h7v12" className={fill} />
          <path d="M7 23h5m7 0h5M7 31h5m7 0h5" />
        </g>
      </Micro>
    </g>
  );
}

function Check({ x, y, i = 0 }: { x: number; y: number; i?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Micro kind="retick" i={i}>
        <path d="m0 6 5 5L17 0" {...motionProps('draw', i, accent)} />
      </Micro>
    </g>
  );
}

/** A horizontal arrow of the given length from (x, y); it nudges forward on hover. */
function Arrow({ x, y, length, i }: { x: number; y: number; length: number; i: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Micro kind="nudge">
        <path d={`M0 0h${length}m-6-5 6 5-6 5`} {...motionProps('draw', i, accent)} />
      </Micro>
    </g>
  );
}

const RIB: Record<string, ReactNode> = {
  // Work piles up and every arrow points at one person.
  before: (
    <>
      <Paper x={24} y={22} i={0} kind="jitter" />
      <Paper x={32} y={30} i={1} kind="jitter" />
      <Paper x={40} y={38} i={2} kind="jitter" />
      <Arrow x={84} y={60} length={38} i={3} />
      <path d="M138 32v56" {...motionProps('draw', 4, accent)} />
      <circle cx="170" cy="45" r="9" {...motionProps('pop', 5)} />
      <path d="M152 82v-8a18 18 0 0 1 36 0v8" {...motionProps('draw', 5)} />
    </>
  ),
  // Decisions are shared: three papers connect, each gets signed off.
  intervention: (
    <>
      <Micro kind="pulse">
        <path d="M66 38h104M66 38l52 51 52-51" {...motionProps('draw', 0, accent)} />
      </Micro>
      <Paper x={49} y={18} i={1} />
      <Paper x={153} y={18} i={2} />
      <Paper x={101} y={69} i={3} />
      <Check x={57} y={33} i={4} />
      <Check x={161} y={33} i={5} />
      <Check x={109} y={84} i={6} />
    </>
  ),
  // The ring closes: four members, each owning their part, no centre.
  result: (
    <>
      <Micro kind="pulse">
        <path d="M71 36h94l27 48H44Z" {...motionProps('draw', 0)} />
      </Micro>
      <circle cx="71" cy="36" r="12" {...motionProps('pop', 2, fill)} />
      <circle cx="165" cy="36" r="12" {...motionProps('pop', 3, fill)} />
      <circle cx="44" cy="84" r="12" {...motionProps('pop', 4, fill)} />
      <circle cx="192" cy="84" r="12" {...motionProps('pop', 5, fill)} />
      <Check x={63} y={31} i={3} />
      <Check x={157} y={31} i={4} />
      <Check x={36} y={79} i={5} />
      <Check x={184} y={79} i={6} />
      <Micro kind="pulse">
        <path d="M95 61h46" {...motionProps('draw', 7, accent)} />
      </Micro>
    </>
  ),
};

const AUDI: Record<string, ReactNode> = {
  // The legacy spreadsheet is drawn row by row, dense and rigid.
  before: (
    <>
      <rect x="24" y="26" width="101" height="68" rx="3" {...motionProps('draw', 0)} />
      <path d="M24 44h101M24 60h101M24 77h101" {...motionProps('draw', 1)} />
      <path d="M51 26v68M84 26v68" {...motionProps('draw', 2)} />
      <path d="M144 60h20" {...motionProps('draw', 3)} />
      <rect x="172" y="31" width="38" height="57" rx="2" {...motionProps('draw', 3)} />
      <Micro kind="pulse">
        <path d="M181 44h20M181 54h20M181 65h20" {...motionProps('draw', 4, accent)} />
      </Micro>
    </>
  ),
  // The process is modelled as states with transitions, in order.
  intervention: (
    <>
      <rect x="22" y="42" width="49" height="36" rx="18" {...motionProps('draw', 0)} />
      <Arrow x={72} y={60} length={22} i={1} />
      <path d="m117 36 24 24-24 24-24-24Z" {...motionProps('draw', 2)} />
      <Arrow x={141} y={60} length={22} i={3} />
      <rect x="163" y="42" width="49" height="36" rx="18" {...motionProps('draw', 4)} />
      <Micro kind="pulse">
        <path d="M118 84v20H47V80" strokeDasharray="3 5" {...motionProps('fade', 5)} />
      </Micro>
      <Check x={179} y={54} i={6} />
    </>
  ),
  // The sign-off lands and the clock hand sweeps: time saved.
  result: (
    <>
      <rect x="28" y="24" width="120" height="70" rx="3" {...motionProps('draw', 0)} />
      <path d="M28 40h120M42 53h46M42 64h33M42 77h50" {...motionProps('draw', 1)} />
      <circle cx="117" cy="68" r="16" {...motionProps('draw', 2, accent)} />
      <Check x={109} y={62} i={3} />
      <circle cx="187" cy="60" r="24" {...motionProps('draw', 4)} />
      <Micro kind="tick">
        <path d="M187 43v17l12 8" {...motionProps('sweep', 5, accent)} />
      </Micro>
    </>
  ),
};

const SELFBITS: Record<string, ReactNode> = {
  // Production on one side, paper orders on the other, no data path between them.
  before: (
    <>
      <Factory x={30} y={42} i={0} />
      <Arrow x={79} y={60} length={32} i={1} />
      <Paper x={127} y={37} i={2} kind="jitter" />
      <Paper x={169} y={37} i={3} kind="jitter" />
      <Micro kind="pulse">
        <path d="M127 87h74" strokeDasharray="2 5" {...motionProps('fade', 4)} />
      </Micro>
    </>
  ),
  // The interface is built, then the handheld; each gets signed off.
  intervention: (
    <>
      <rect x="24" y="25" width="144" height="70" rx="3" {...motionProps('draw', 0)} />
      <path d="M24 40h144M80 95v10m-18 0h36" {...motionProps('draw', 1)} />
      <path d="M37 53h70M37 64h52M37 76h62" {...motionProps('draw', 2)} />
      <Check x={126} y={59} i={3} />
      <rect x="181" y="49" width="30" height="52" rx="4" {...motionProps('pop', 4, fill)} />
      <Check x={187} y={67} i={5} />
    </>
  ),
  // The network is laid out, then five sites switch on one after another.
  result: (
    <>
      <Micro kind="pulse">
        <path
          d="M63 48h112M43 97h152M63 48l-20 49m132-49 20 49M119 48v49"
          strokeDasharray="3 5"
          {...motionProps('fade', 0)}
        />
      </Micro>
      <Factory x={47} y={15} i={1} />
      <Factory x={159} y={15} i={2} />
      <Factory x={27} y={68} i={3} />
      <Factory x={103} y={68} i={4} />
      <Factory x={179} y={68} i={5} />
    </>
  ),
};

const SKETCHES = { rib: RIB, audi: AUDI, selfbits: SELFBITS };

/** Schematics describe the process; only the factory footprint represents a documented count. */
export function FieldnoteSketch({
  story,
  phase,
}: {
  story: keyof typeof SKETCHES;
  phase: 'before' | 'intervention' | 'result';
}) {
  return (
    <FieldnoteReveal>
      <svg
        viewBox="0 0 240 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {SKETCHES[story][phase]}
      </svg>
    </FieldnoteReveal>
  );
}
