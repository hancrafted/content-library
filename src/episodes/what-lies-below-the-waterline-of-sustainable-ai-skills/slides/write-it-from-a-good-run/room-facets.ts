/*
 * The control room of "Write it from a good run", lifted facet by facet from Spec Option 10b (feedback 3, decision
 * 46), in the Spec's 300 by 236 panel units, figures standing on the floor line at 210: its faceted wall and floor, the
 * card he writes at the console, the wall clock and the card pinned up the next morning. The Spec's console and people
 * are left out: the shared Console and cast stand in front of it.
 */

/** A tone of the drawing; `day-art.module.css` gives each its fill. */
export type ArtTone =
  | 'room-lit'
  | 'room'
  | 'room-shade'
  | 'floor'
  | 'floor-lit'
  | 'card-glow'
  | 'paper-lit'
  | 'paper'
  | 'paper-shade'
  | 'paper-rule'
  | 'robot-lit'
  | 'robot-shade'
  | 'house-lit'
  | 'house'
  | 'cloth-dark'
  | 'pin';

/** One facet: its tone and its SVG path. */
export type ArtFacet = readonly [tone: ArtTone, d: string];

/** Panels 2 to 4: the control room's faceted wall and floor. */
export const ROOM_WALL: readonly ArtFacet[] = [
  ['room-lit', 'M251 0L230 52L171 0Z'],
  ['room', 'M130 206L70 206L120 148ZM197 155L130 206L120 148ZM197 155L230 52L255 115ZM69 90L147 43L120 148Z'],
  ['room-lit', 'M230 52L147 43L171 0ZM147 43L105 0L171 0ZM105 0L147 43L69 90ZM147 43L197 155L120 148Z'],
  ['room', 'M197 155L147 43L230 52Z'],
  ['room-shade', 'M300 54L300 127L255 115Z'],
  ['room', 'M230 52L300 54L255 115ZM300 54L251 0L300 0ZM300 54L230 52L251 0Z'],
  ['room-lit', 'M0 150L0 52L69 90Z'],
  ['room', 'M47 163L69 90L120 148Z'],
  ['room-shade', 'M70 206L47 163L120 148Z'],
  ['room', 'M47 163L0 150L69 90Z'],
  ['room-shade', 'M47 163L70 206L0 206ZM0 150L47 163L0 206ZM236 206L197 155L255 115Z'],
  ['room', 'M236 206L300 127L300 206Z'],
  ['room-shade', 'M300 127L236 206L255 115Z'],
  ['room-lit', 'M63 0L0 52L0 0ZM0 52L63 0L69 90ZM63 0L105 0L69 90Z'],
  ['room-shade', 'M197 155L192 206L130 206ZM236 206L192 206L197 155ZM0 201L300 201L300 206L0 206Z'],
  ['floor', 'M32 206L0 236L0 206Z'],
  ['floor-lit', 'M270 206L266 236L226 236ZM221 206L270 206L226 236Z'],
  ['floor', 'M266 236L270 206L300 236ZM300 236L270 206L300 206ZM118 206L106 236L70 206ZM118 206L153 236L106 236Z'],
  ['floor-lit', 'M153 236L118 206L153 206ZM37 236L32 206L70 206ZM32 206L37 236L0 236ZM192 206L187 236L153 206Z'],
  ['floor', 'M187 236L153 236L153 206Z'],
  ['floor-lit', 'M187 236L192 206L221 206ZM187 236L221 206L226 236Z'],
  ['floor', 'M106 236L74 236L70 206ZM74 236L37 236L70 206Z'],
];

/** Panel 3: the card he writes at the console, glowing in the screen light; in panel units. */
export const WRITTEN_CARD: readonly ArtFacet[] = [
  ['card-glow', 'M214 138L226 124L262 124L274 138L262 152L226 152Z'],
  ['paper-lit', 'M221.2 127.6L261.1 124.4L222.9 149.6Z'],
  ['paper', 'M261.1 124.4L262.8 146.4L222.9 149.6Z'],
  ['paper-shade', 'M254.8 147L262.2 138.4L262.8 146.4Z'],
  [
    'paper-rule',
    'M227.7 133.3L251.7 131.4L251.8 133L227.8 134.9ZM228 137.7L247.5 136.1L247.7 137.7L228.1 139.3ZM228.4 142.1L250.7 140.3L250.8 141.9L228.5 143.7Z',
  ],
];

/** Panel 4: the wall clock: the night has passed. */
export const WALL_CLOCK: readonly ArtFacet[] = [
  ['robot-lit', 'M30 32L39.9 36.1L37.9 38.1L30 34.8Z'],
  [
    'robot-shade',
    'M39.9 36.1L44 46L41.2 46L37.9 38.1ZM44 46L39.9 55.9L37.9 53.9L41.2 46ZM39.9 55.9L30 60L30 57.2L37.9 53.9ZM30 60L20.1 55.9L22.1 53.9L30 57.2Z',
  ],
  [
    'robot-lit',
    'M20.1 55.9L16 46L18.8 46L22.1 53.9ZM16 46L20.1 36.1L22.1 38.1L18.8 46ZM20.1 36.1L30 32L30 34.8L22.1 38.1Z',
  ],
  ['house-lit', 'M30 46L30 34.8L37.9 38.1Z'],
  ['house', 'M30 46L37.9 38.1L41.2 46ZM30 46L41.2 46L37.9 53.9ZM30 46L37.9 53.9L30 57.2ZM30 46L30 57.2L22.1 53.9Z'],
  ['house-lit', 'M30 46L22.1 53.9L18.8 46ZM30 46L18.8 46L22.1 38.1ZM30 46L22.1 38.1L30 34.8Z'],
  ['cloth-dark', 'M29.2 45.5L26.8 51.5L30.8 46.5ZM29.2 46L30 36.5L30.8 46Z'],
];

/** Panel 4: the written card pinned to the wall, still there the next morning. */
export const PINNED_CARD: readonly ArtFacet[] = [
  ['card-glow', 'M56 66L68 36L104 36L116 66L104 96L68 96Z'],
  ['paper-lit', 'M67.3 29.2L109.2 30.9L64.8 91.1Z'],
  ['paper', 'M109.2 30.9L106.7 92.8L64.8 91.1Z'],
  ['paper-shade', 'M98.4 92.5L107.1 84.4L106.7 92.8Z'],
  [
    'paper-rule',
    'M72.6 46.8L98.3 47.8L98.3 49.4L72.5 48.4ZM72.2 56.1L93.2 56.9L93.1 58.5L72.1 57.7ZM71.8 65.4L95.8 66.3L95.7 67.9L71.7 67ZM71.4 74.6L87.9 75.3L87.9 76.9L71.4 76.2Z',
  ],
  ['pin', 'M84 26L90 26L89 34L85 34Z'],
];
