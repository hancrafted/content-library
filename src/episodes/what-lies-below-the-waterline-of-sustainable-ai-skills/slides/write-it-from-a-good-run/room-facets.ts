/*
 * The control room of "Write it from a good run", lifted facet by facet from Spec Option 10b (feedback 3, decision
 * 46), in the Spec's 300 by 236 panel units, figures standing on the floor line at 210: its faceted wall and floor, the
 * card he writes at the console, the wall clock and the card pinned up the next morning. The Spec's console and people
 * are left out: the shared Console and cast stand in front of it.
 */

/** A tone of the drawing; `day-art.module.css` gives each its fill. */

/** A panel picture's drawing space, the Spec's: 300 by 236, figures standing on the floor line at 210. */
export const PANEL_ART = { width: 300, height: 236, floor: 210 } as const;

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
  ['paper-lit', 'M221 128L261 124L223 150Z'],
  ['paper', 'M261 124L263 146L223 150Z'],
  ['paper-shade', 'M255 147L262 138L263 146Z'],
  ['paper-rule', 'M228 133L252 131L252 133L228 135ZM228 138L248 136L248 138L228 139ZM228 142L251 140L251 142L229 144Z'],
];

/** Panel 4: the wall clock: the night has passed. */
export const WALL_CLOCK: readonly ArtFacet[] = [
  ['robot-lit', 'M30 32L40 36L38 38L30 35Z'],
  [
    'robot-shade',
    'M40 36L44 46L41 46L38 38ZM44 46L40 56L38 54L41 46ZM40 56L30 60L30 57L38 54ZM30 60L20 56L22 54L30 57Z',
  ],
  ['robot-lit', 'M20 56L16 46L19 46L22 54ZM16 46L20 36L22 38L19 46ZM20 36L30 32L30 35L22 38Z'],
  ['house-lit', 'M30 46L30 35L38 38Z'],
  ['house', 'M30 46L38 38L41 46ZM30 46L41 46L38 54ZM30 46L38 54L30 57ZM30 46L30 57L22 54Z'],
  ['house-lit', 'M30 46L22 54L19 46ZM30 46L19 46L22 38ZM30 46L22 38L30 35Z'],
  ['cloth-dark', 'M29 46L27 52L31 47ZM29 46L30 37L31 46Z'],
];

/** Panel 4: the written card pinned to the wall, still there the next morning. */
export const PINNED_CARD: readonly ArtFacet[] = [
  ['card-glow', 'M56 66L68 36L104 36L116 66L104 96L68 96Z'],
  ['paper-lit', 'M67 29L109 31L65 91Z'],
  ['paper', 'M109 31L107 93L65 91Z'],
  ['paper-shade', 'M98 93L107 84L107 93Z'],
  [
    'paper-rule',
    'M73 47L98 48L98 49L73 48ZM72 56L93 57L93 59L72 58ZM72 65L96 66L96 68L72 67ZM71 75L88 75L88 77L71 76Z',
  ],
  ['pin', 'M84 26L90 26L89 34L85 34Z'],
];
