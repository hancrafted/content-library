import { Dartboard } from '@/episodes/components/slide-shared/dartboard/dartboard';
import { Darts, type DartTone, type Point } from '@/episodes/components/slide-shared/dartboard/darts';

/** Where the five darts land: tight or loose, on the bull or off it, in the board's 200 by 200 units. */
const THROWS = {
  'tight-on': [
    { x: 94, y: 96 },
    { x: 105, y: 94 },
    { x: 97, y: 106 },
    { x: 107, y: 104 },
    { x: 100, y: 100 },
  ],
  'tight-off': [
    { x: 132, y: 58 },
    { x: 143, y: 56 },
    { x: 135, y: 68 },
    { x: 145, y: 66 },
    { x: 138, y: 62 },
  ],
  'loose-on': [
    { x: 60, y: 70 },
    { x: 134, y: 64 },
    { x: 70, y: 138 },
    { x: 142, y: 128 },
    { x: 104, y: 146 },
  ],
  'loose-off': [
    { x: 44, y: 60 },
    { x: 148, y: 50 },
    { x: 56, y: 152 },
    { x: 158, y: 130 },
    { x: 110, y: 162 },
  ],
} as const satisfies Record<string, readonly Point[]>;

/**
 * One outcome's dartboard: tight darts on the bull in `primary`, darts off target in `warning`, loose darts on target
 * dulled toward `muted-foreground`, as the Visual language colours a throw.
 */
export function OutcomeBoard({ spread, onTarget }: { spread: 'tight' | 'loose'; onTarget: boolean }) {
  const tone: DartTone = !onTarget ? 'warning' : spread === 'tight' ? 'primary' : 'dulled';
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-auto w-3/4" aria-hidden="true">
      <Dartboard cx={100} cy={100} r={92} rings={3} bull={18} tone="hero" bullTone="muted" />
      <Darts points={THROWS[`${spread}-${onTarget ? 'on' : 'off'}`]} tone={tone} r={6} edge />
    </svg>
  );
}
