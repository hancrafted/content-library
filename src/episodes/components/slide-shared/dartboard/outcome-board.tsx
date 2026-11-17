import { Dartboard } from './dartboard';
import { Darts, type DartTone, type Point } from './darts';

export type PrecisionOutcome = 'precise-accurate' | 'precise-off' | 'accurate-scattered' | 'neither';

const THROWS: Record<PrecisionOutcome, { readonly darts: readonly Point[]; readonly tone: DartTone }> = {
  'precise-accurate': {
    darts: [
      { x: 57, y: 58 },
      { x: 63, y: 61 },
      { x: 59, y: 64 },
      { x: 62, y: 56 },
    ],
    tone: 'primary',
  },
  'precise-off': {
    darts: [
      { x: 86, y: 32 },
      { x: 92, y: 36 },
      { x: 88, y: 39 },
      { x: 93, y: 30 },
    ],
    tone: 'warning',
  },
  'accurate-scattered': {
    darts: [
      { x: 40, y: 50 },
      { x: 78, y: 44 },
      { x: 55, y: 86 },
      { x: 74, y: 76 },
    ],
    tone: 'dulled',
  },
  neither: {
    darts: [
      { x: 22, y: 30 },
      { x: 96, y: 70 },
      { x: 80, y: 22 },
      { x: 34, y: 94 },
    ],
    tone: 'warning',
  },
};

// decision: FE-007 §5
export function OutcomeBoard({ outcome, className }: { outcome: PrecisionOutcome; className?: string }) {
  const { darts, tone } = THROWS[outcome];
  return (
    <svg viewBox="0 0 120 120" data-outcome-board={outcome} className={className} aria-hidden="true">
      <Dartboard cx={60} cy={60} r={56} rings={3} bull={10} tone="hero" bullTone="muted" />
      <Darts points={darts} tone={tone} r={5} edge />
    </svg>
  );
}
