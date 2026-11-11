import { Dartboard } from './dartboard';
import { Darts, type DartTone, type Point } from './darts';

/**
 * The four outcomes of precision and accuracy: precise or not (a tight or loose cluster), accurate or not (on the bull
 * or off it).
 */
export type PrecisionOutcome = 'precise-accurate' | 'precise-off' | 'accurate-scattered' | 'neither';

/**
 * Where each outcome's four darts land on the 120 by 120 board, and the one colour it throws in: on the bull in
 * `primary`, off target in `warning`, a loose cluster around the bull dulled toward `muted-foreground`, never a hue.
 */
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

/**
 * One outcome as a dartboard: the hero board with a dulled bull, so darts in `primary` still read on it, and the
 * outcome's four darts on a `card` edge. Shared because the precision and accuracy Slide and the requirements
 * engineering Slide both draw the four outcomes (FE-007); the Slide sizes it through `className`.
 */
export function OutcomeBoard({ outcome, className }: { outcome: PrecisionOutcome; className?: string }) {
  const { darts, tone } = THROWS[outcome];
  return (
    <svg viewBox="0 0 120 120" data-outcome-board={outcome} className={className} aria-hidden="true">
      <Dartboard cx={60} cy={60} r={56} rings={3} bull={10} tone="hero" bullTone="muted" />
      <Darts points={darts} tone={tone} r={5} edge />
    </svg>
  );
}
