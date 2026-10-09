import { FieldnoteReveal } from '@/components/landing/fieldnote-reveal.client';
import styles from '@/components/landing/fieldnote-sketch.module.css';
import type { ReactNode } from 'react';

function Paper({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="32" height="40" rx="2" className={styles.paperFill} />
      <path d="M8 12h16M8 20h16M8 28h9" />
    </g>
  );
}

function Factory({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 28V12l12-8v8l12-8v8h10v28H0ZM27 12V0h7v12" className={styles.paperFill} />
      <path d="M7 23h5m7 0h5M7 31h5m7 0h5" />
    </g>
  );
}

function Check({ x, y }: { x: number; y: number }) {
  return <path transform={`translate(${x} ${y})`} d="m0 6 5 5L17 0" className={styles.accentStroke} />;
}

const RIB: Record<string, ReactNode> = {
  before: (
    <>
      <Paper x={24} y={22} />
      <Paper x={32} y={30} />
      <Paper x={40} y={38} />
      <path d="M84 60h38m-7-6 7 6-7 6M138 32v56" className={styles.accentStroke} />
      <circle cx="170" cy="45" r="9" />
      <path d="M152 82v-8a18 18 0 0 1 36 0v8" />
    </>
  ),
  intervention: (
    <>
      <path d="M66 38h104M66 38l52 51 52-51" className={styles.accentStroke} />
      <Paper x={49} y={18} />
      <Paper x={153} y={18} />
      <Paper x={101} y={69} />
      <Check x={57} y={33} />
      <Check x={161} y={33} />
      <Check x={109} y={84} />
    </>
  ),
  result: (
    <>
      <path d="M71 36h94l27 48H44Z" />
      <circle cx="71" cy="36" r="12" className={styles.paperFill} />
      <circle cx="165" cy="36" r="12" className={styles.paperFill} />
      <circle cx="44" cy="84" r="12" className={styles.paperFill} />
      <circle cx="192" cy="84" r="12" className={styles.paperFill} />
      <Check x={63} y={31} />
      <Check x={157} y={31} />
      <Check x={36} y={79} />
      <Check x={184} y={79} />
      <path d="M95 61h46" className={styles.accentStroke} />
    </>
  ),
};

const AUDI: Record<string, ReactNode> = {
  before: (
    <>
      <rect x="24" y="26" width="101" height="68" rx="3" />
      <path d="M24 44h101M24 60h101M24 77h101M51 26v68M84 26v68M144 60h20" />
      <rect x="172" y="31" width="38" height="57" rx="2" />
      <path d="M181 44h20M181 54h20M181 65h20" className={styles.accentStroke} />
    </>
  ),
  intervention: (
    <>
      <rect x="22" y="42" width="49" height="36" rx="18" />
      <path d="M72 60h22m-6-5 6 5-6 5M141 60h22m-6-5 6 5-6 5" className={styles.accentStroke} />
      <path d="m117 36 24 24-24 24-24-24Z" />
      <rect x="163" y="42" width="49" height="36" rx="18" />
      <path d="M118 84v20H47V80" strokeDasharray="3 5" />
      <Check x={179} y={54} />
    </>
  ),
  result: (
    <>
      <rect x="28" y="24" width="120" height="70" rx="3" />
      <path d="M28 40h120M42 53h46M42 64h33M42 77h50" />
      <circle cx="117" cy="68" r="16" className={styles.accentStroke} />
      <Check x={109} y={62} />
      <circle cx="187" cy="60" r="24" />
      <path d="M187 43v17l12 8" className={styles.accentStroke} />
    </>
  ),
};

const SELFBITS: Record<string, ReactNode> = {
  before: (
    <>
      <Factory x={30} y={42} />
      <path d="M79 60h32m-6-5 6 5-6 5" className={styles.accentStroke} />
      <Paper x={127} y={37} />
      <Paper x={169} y={37} />
      <path d="M127 87h74" strokeDasharray="2 5" />
    </>
  ),
  intervention: (
    <>
      <rect x="24" y="25" width="144" height="70" rx="3" />
      <path d="M24 40h144M80 95v10m-18 0h36M37 53h70M37 64h52M37 76h62" />
      <rect x="181" y="49" width="30" height="52" rx="4" className={styles.paperFill} />
      <Check x={187} y={67} />
      <Check x={126} y={59} />
    </>
  ),
  result: (
    <>
      <path d="M63 48h112M43 97h152M63 48l-20 49m132-49 20 49M119 48v49" strokeDasharray="3 5" />
      <Factory x={47} y={15} />
      <Factory x={159} y={15} />
      <Factory x={27} y={68} />
      <Factory x={103} y={68} />
      <Factory x={179} y={68} />
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
