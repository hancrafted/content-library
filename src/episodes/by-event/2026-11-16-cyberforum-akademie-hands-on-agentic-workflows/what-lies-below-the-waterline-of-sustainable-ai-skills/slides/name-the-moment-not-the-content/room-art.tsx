import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import styles from './slide.module.css';
import { ART_SCALE, ART_TOP } from './speech.pure';

/*
 * The drawing lifted from the approved Spec's Option 12a (feedback 3, decision 46): the control room's faceted walls
 * and floor, and the skill index sheet's faceted paper and clip. Facets keep the Spec's own numbers, in its 1000 by 640
 * space; their tones are this Slide's tokens in `slide.module.css`. The cast and the console stay the shared figures,
 * placed on top; the sheet's words stay real text over its paper.
 */

/** One facet: its tone, the token that fills it, and its outline. */
type Facet = readonly [tone: string, d: string];

const ROOM: readonly Facet[] = [
  ['room', 'M1000 331.8L924 442.7L864.4 278.5ZM924 442.7L702.8 454.3L864.4 278.5ZM608.3 107.6L734 195.1L530.6 250.8Z'],
  ['room-shade', 'M1000 482.5L924 442.7L1000 331.8ZM773.4 584L702.8 454.3L924 442.7ZM371.1 584L438.8 431.1L503.6 584Z'],
  ['room', 'M1000 223.6L1000 331.8L864.4 278.5Z'],
  ['room-lit', 'M608.3 107.6L755.4 0L734 195.1Z'],
  ['room-shade', 'M773.4 584L620.7 584L702.8 454.3Z'],
  ['room', 'M858.7 584L773.4 584L924 442.7Z'],
  ['room-lit', 'M858.7 584L1000 482.5L1000 584Z'],
  ['room-shade', 'M1000 482.5L858.7 584L924 442.7Z'],
  ['room-lit', 'M129.3 251.8L0 131L145.2 118.3ZM145.2 118.3L121.6 0L231.1 0Z'],
  ['room', 'M121.6 0L0 131L0 0Z'],
  ['room-lit', 'M0 131L121.6 0L145.2 118.3ZM359.4 0L353.8 85.1L231.1 0Z'],
  ['room', 'M483.2 97.2L608.3 107.6L530.6 250.8ZM608.3 107.6L483.2 97.2L494.5 0Z'],
  ['room-lit', 'M483.2 97.2L359.4 0L494.5 0ZM359.4 0L483.2 97.2L353.8 85.1Z'],
  ['room-shade', 'M551.6 378.1L367 326.5L530.6 250.8Z'],
  ['room', 'M367 326.5L551.6 378.1L438.8 431.1ZM0 486.3L155.4 584L0 584ZM734 195.1L662.7 320.5L530.6 250.8Z'],
  ['room-shade', 'M662.7 320.5L551.6 378.1L530.6 250.8Z'],
  [
    'room',
    'M551.6 378.1L662.7 320.5L702.8 454.3ZM662.7 320.5L734 195.1L864.4 278.5ZM702.8 454.3L662.7 320.5L864.4 278.5Z',
  ],
  [
    'room-shade',
    'M438.8 431.1L541.9 506.2L503.6 584ZM551.6 378.1L541.9 506.2L438.8 431.1ZM541.9 506.2L620.7 584L503.6 584Z',
  ],
  ['room', 'M541.9 506.2L551.6 378.1L702.8 454.3Z'],
  ['room-shade', 'M620.7 584L541.9 506.2L702.8 454.3ZM300 431.4L371.1 584L235.6 584ZM371.1 584L300 431.4L438.8 431.1Z'],
  ['room', 'M300 431.4L367 326.5L438.8 431.1ZM367 326.5L300 431.4L238 317.4ZM626.5 0L608.3 107.6L494.5 0Z'],
  ['room-lit', 'M626.5 0L755.4 0L608.3 107.6Z'],
  ['room-shade', 'M1000 145.8L859.3 97L1000 0Z'],
  ['room-lit', 'M755.4 0L859.3 97L734 195.1Z'],
  ['room', 'M734 195.1L859.3 97L864.4 278.5Z'],
  ['room-shade', 'M1000 223.6L859.3 97L1000 145.8ZM859.3 97L1000 223.6L864.4 278.5Z'],
  ['room-lit', 'M0 225.9L129.3 251.8L0 346.1Z'],
  ['room', 'M129.3 251.8L0 225.9L0 131Z'],
  ['room-lit', 'M291.7 190.5L367 326.5L238 317.4ZM129.3 251.8L291.7 190.5L238 317.4Z'],
  ['room', 'M291.7 190.5L129.3 251.8L145.2 118.3Z'],
  ['room-lit', 'M291.7 190.5L145.2 118.3L231.1 0ZM353.8 85.1L291.7 190.5L231.1 0Z'],
  ['room', 'M86.7 375.9L0 486.3L0 346.1ZM86.7 375.9L129.3 251.8L238 317.4Z'],
  ['room-shade', 'M129.3 251.8L86.7 375.9L0 346.1Z'],
  ['room', 'M859.3 97L879.1 0L1000 0Z'],
  [
    'room-lit',
    'M879.1 0L859.3 97L755.4 0ZM483.2 97.2L415.7 208.5L353.8 85.1ZM415.7 208.5L291.7 190.5L353.8 85.1ZM415.7 208.5L483.2 97.2L530.6 250.8ZM367 326.5L415.7 208.5L530.6 250.8ZM291.7 190.5L415.7 208.5L367 326.5Z',
  ],
  ['room-shade', 'M0 486.3L178.2 454.1L155.4 584Z'],
  ['room-lit', 'M86.7 375.9L178.2 454.1L0 486.3Z'],
  [
    'room',
    'M155.4 584L178.2 454.1L235.6 584ZM178.2 454.1L300 431.4L235.6 584ZM300 431.4L178.2 454.1L238 317.4ZM178.2 454.1L86.7 375.9L238 317.4Z',
  ],
  ['floor', 'M99.9 584L0 640L0 584ZM550.7 640L439.4 640L471.8 584ZM439.4 640L378.2 584L471.8 584Z'],
  [
    'floor-lit',
    'M181.3 640L99.9 584L203.4 584ZM836.9 584L816.6 640L733.6 584ZM816.6 640L836.9 584L890.6 584ZM99.9 584L102.3 640L0 640ZM181.3 640L102.3 640L99.9 584Z',
  ],
  ['floor', 'M293.3 640L181.3 640L203.4 584ZM554.3 584L550.7 640L471.8 584ZM554.3 584L628.2 584L550.7 640Z'],
  ['floor-lit', 'M816.6 640L709.9 640L733.6 584Z'],
  ['floor', 'M925.8 640L816.6 640L890.6 584ZM925.8 640L890.6 584L1000 584Z'],
  ['floor-lit', 'M1000 640L925.8 640L1000 584Z'],
  ['floor', 'M295.4 584L293.3 640L203.4 584Z'],
  ['floor-lit', 'M346.8 640L378.2 584L439.4 640Z'],
  ['floor', 'M346.8 640L295.4 584L378.2 584ZM295.4 584L346.8 640L293.3 640Z'],
  ['floor-lit', 'M655.2 640L628.2 584L733.6 584ZM709.9 640L655.2 640L733.6 584ZM628.2 584L655.2 640L550.7 640Z'],
];

const PAPER: readonly Facet[] = [
  [
    'paper-lit',
    'M728.1 109.3L651.6 34L782.1 34ZM620.3 233.4L728.1 109.3L727 273.3ZM825.4 178.3L728.1 109.3L782.1 34ZM728.1 109.3L825.4 178.3L727 273.3ZM825.4 178.3L815.3 339.6L727 273.3Z',
  ],
  ['paper-shade', 'M815.3 339.6L825.4 178.3L968 267.2Z'],
  ['paper-lit', 'M659.8 397.4L620.3 233.4L727 273.3Z'],
  ['paper-shade', 'M634.6 486L659.8 397.4L769.1 486Z'],
  ['paper', 'M659.8 397.4L634.6 486L548 486ZM815.3 339.6L659.8 397.4L727 273.3Z'],
  ['paper-shade', 'M659.8 397.4L815.3 339.6L769.1 486ZM815.3 339.6L869.5 486L769.1 486Z'],
  ['paper', 'M869.5 486L905.9 409.3L968 486Z'],
  ['paper-shade', 'M905.9 409.3L869.5 486L815.3 339.6Z'],
  ['paper-lit', 'M548 130.1L651.6 34L728.1 109.3ZM620.3 233.4L548 130.1L728.1 109.3Z'],
  ['paper', 'M651.6 34L548 130.1L548 34ZM548 130.1L620.3 233.4L548 283.6Z'],
  ['paper-lit', 'M854.8 34L825.4 178.3L782.1 34Z'],
  ['paper', 'M620.3 233.4L548 353.9L548 283.6Z'],
  ['paper-lit', 'M659.8 397.4L548 353.9L620.3 233.4Z'],
  ['paper', 'M548 353.9L659.8 397.4L548 486ZM968 354.2L815.3 339.6L968 267.2Z'],
  ['paper-shade', 'M968 354.2L905.9 409.3L815.3 339.6Z'],
  ['paper', 'M905.9 409.3L968 354.2L968 486ZM968 133.1L854.8 34L968 34ZM854.8 34L968 133.1L825.4 178.3Z'],
  ['paper-shade', 'M825.4 178.3L968 133.1L968 267.2Z'],
  ['paper-edge', 'M548 483L968 483L968 486L548 486ZM965 34L968 34L968 486L965 486Z'],
];

const CLIP: readonly Facet[] = [
  ['clip-shade', 'M724 30L792 30L788 52L728 52Z'],
  ['clip-lit', 'M724 30L762 30L750 52L728 52Z'],
  ['clip-dark', 'M736 14L742 14L746 32L740 32ZM774 14L780 14L776 32L770 32ZM736 12L780 12L780 16L736 16Z'],
];

/** The room behind the cast: faceted walls and floor. */
export function RoomArt() {
  return (
    <g aria-hidden data-room-art className={styles.art} transform={`translate(0 ${ART_TOP}) scale(${ART_SCALE})`}>
      <ToneFacets facets={ROOM} />
    </g>
  );
}

/** The index sheet's faceted paper and its edge, stretched to the sheet. */
export function SheetPaper() {
  return (
    <svg
      aria-hidden
      viewBox="548 34 420 452"
      preserveAspectRatio="none"
      className={cn(styles.art, 'pointer-events-none absolute inset-0 size-full')}
    >
      <ToneFacets facets={PAPER} />
    </svg>
  );
}

/** The clip that holds the sheet to the wall, over the sheet's top edge. */
export function SheetClip() {
  return (
    <svg
      aria-hidden
      viewBox="724 12 68 40"
      className={cn(
        styles.art,
        'pointer-events-none absolute top-0 left-1/2 w-[16%] -translate-x-1/2 -translate-y-[55%]',
      )}
    >
      <ToneFacets facets={CLIP} />
    </svg>
  );
}
