/*
 * The control room of "The third time is the signal", lifted facet by facet from Spec Option 8a (feedback 3, decision
 * 46): a 360 by 280 room, floor line at 256, lit from the upper left. The Spec's robot on the deck is left out: by this
 * Slide the robot is in the water (ROBOT_STORY), so the window shows the A-frame and its cable only. The shared Console
 * and cast stand in front of it.
 */

/** A tone of the drawing; `room-art.module.css` gives each its fill. */

/** The room's drawing space, the Spec's: 360 by 280, figures standing on the floor line at 256. */
export const ROOM_ART = { width: 360, height: 280, floor: 256 } as const;

export type ArtTone =
  | 'room-shade'
  | 'room-lit'
  | 'room'
  | 'floor'
  | 'floor-lit'
  | 'frame-lit'
  | 'frame-shade'
  | 'sky-1'
  | 'sky-2'
  | 'sky-3'
  | 'sky-4'
  | 'cloud-lit'
  | 'cloud-shade'
  | 'sea-surface-lit'
  | 'sea-surface'
  | 'hull-lit'
  | 'hull'
  | 'steel-shade'
  | 'steel-lit'
  | 'pane-glint'
  | 'house-lit'
  | 'house'
  | 'cloth-dark'
  | 'paper'
  | 'paper-lit'
  | 'paper-edge';

/** One facet: its tone and its SVG path. */
export type ArtFacet = readonly [tone: ArtTone, d: string];

/** The wall, the floor, the window onto the deck (sky, clouds, sea, rail, A-frame) and the wall clock. */
export const ROOM: readonly ArtFacet[] = [
  ['room-shade', 'M296 155L360 77L360 127Z'],
  ['room-lit', 'M0 199L61 252L0 252Z'],
  ['room', 'M61 252L0 199L45 158Z'],
  ['room-shade', 'M122 173L61 252L45 158Z'],
  ['room', 'M261 56L296 155L201 112Z'],
  ['room-lit', 'M296 155L261 56L360 77Z'],
  ['room', 'M360 184L296 155L360 127ZM287 252L360 184L360 252Z'],
  ['room-shade', 'M360 184L287 252L296 155ZM201 196L122 173L201 112ZM296 155L201 196L201 112Z'],
  ['room', 'M201 196L287 252L202 252Z'],
  ['room-shade', 'M287 252L201 196L296 155Z'],
  ['room', 'M87 55L122 173L45 158Z'],
  ['room-lit', 'M87 55L57 0L137 0Z'],
  ['room', 'M122 173L87 55L201 112Z'],
  ['room-shade', 'M122 173L149 252L61 252Z'],
  ['room', 'M149 252L201 196L202 252Z'],
  ['room-shade', 'M201 196L149 252L122 173Z'],
  ['room', 'M285 0L261 56L207 0Z'],
  ['room-shade', 'M360 77L285 0L360 0Z'],
  ['room-lit', 'M261 56L285 0L360 77ZM87 55L172 40L201 112ZM172 40L87 55L137 0ZM172 40L137 0L207 0Z'],
  ['room', 'M172 40L261 56L201 112ZM261 56L172 40L207 0ZM57 0L0 71L0 0Z'],
  ['room-lit', 'M87 55L0 71L57 0ZM0 114L87 55L45 158ZM0 114L0 71L87 55Z'],
  ['room', 'M0 199L0 114L45 158Z'],
  ['room-shade', 'M0 246L360 246L360 252L0 252Z'],
  ['floor', 'M360 280L315 280L360 252Z'],
  ['floor-lit', 'M0 280L40 252L54 280Z'],
  ['floor', 'M40 252L0 280L0 252Z'],
  ['floor-lit', 'M136 280L178 252L182 280ZM315 252L315 280L273 280ZM265 252L315 252L273 280Z'],
  ['floor', 'M315 280L315 252L360 252Z'],
  ['floor-lit', 'M235 280L265 252L273 280ZM40 252L89 252L54 280Z'],
  ['floor', 'M235 280L214 252L265 252ZM214 252L235 280L182 280ZM178 252L214 252L182 280Z'],
  ['floor-lit', 'M136 280L135 252L178 252Z'],
  ['floor', 'M89 252L98 280L54 280ZM135 252L98 280L89 252Z'],
  ['floor-lit', 'M98 280L135 252L136 280Z'],
  ['frame-lit', 'M199 7L351 7L344 14L206 14ZM199 7L206 14L206 96L199 103Z'],
  ['frame-shade', 'M351 7L351 103L344 96L344 14ZM199 103L206 96L344 96L351 103Z'],
  ['sky-1', 'M346 31L305 12L346 12ZM305 12L294 23L251 12Z'],
  ['sky-2', 'M256 35L294 23L294 35ZM294 23L346 31L294 35ZM294 23L305 12L346 31ZM232 23L256 35L204 34Z'],
  ['sky-1', 'M251 12L232 23L204 12ZM232 23L204 34L204 12ZM294 23L232 23L251 12Z'],
  ['sky-2', 'M232 23L294 23L256 35ZM256 39L204 44L204 34ZM294 35L294 35L346 31ZM258 35L256 39L204 34Z'],
  ['sky-3', 'M258 35L294 35L256 39ZM294 35L258 35L294 35Z'],
  ['sky-4', 'M346 54L321 43L346 31Z'],
  ['sky-3', 'M245 54L204 54L204 44ZM258 39L245 54L204 44ZM321 43L294 35L346 31ZM306 54L245 54L258 39Z'],
  ['sky-4', 'M294 35L306 54L258 39ZM306 54L294 35L321 43ZM306 54L321 43L346 54Z'],
  ['cloud-lit', 'M292 25L294 14L301 19ZM301 19L302 13L307 12ZM300 29L292 25L301 19Z'],
  ['cloud-shade', 'M300 29L293 35L292 25Z'],
  ['cloud-lit', 'M290 15L292 25L287 17ZM292 25L290 15L294 14ZM292 25L285 19L287 17ZM283 24L292 25L285 35Z'],
  ['cloud-shade', 'M328 31L324 32L328 29ZM324 32L326 27L328 29Z'],
  ['cloud-lit', 'M310 26L300 29L301 19ZM294 14L298 15L301 19ZM298 15L302 13L301 19Z'],
  ['cloud-shade', 'M292 25L289 35L285 35ZM293 35L289 35L292 25ZM297 35L300 29L300 35ZM297 35L293 35L300 29Z'],
  ['cloud-lit', 'M278 34L277 26L279 25ZM284 22L285 19L292 25ZM283 24L284 22L292 25ZM326 25L318 27L324 23Z'],
  ['cloud-shade', 'M326 27L318 27L326 25ZM318 27L324 32L320 32ZM324 32L318 27L326 27ZM310 26L304 34L300 29Z'],
  ['cloud-lit', 'M280 35L278 34L279 25Z'],
  ['cloud-shade', 'M280 35L283 24L285 35Z'],
  ['cloud-lit', 'M283 24L280 35L279 25ZM318 20L318 27L310 26ZM278 34L275 28L277 26Z'],
  ['cloud-shade', 'M280 35L277 35L278 34ZM318 27L322 21L324 23Z'],
  [
    'cloud-lit',
    'M318 20L322 21L318 27ZM310 18L318 20L310 26ZM314 15L310 18L311 12ZM310 18L310 26L301 19ZM311 12L310 18L307 12ZM310 18L301 19L307 12Z',
  ],
  ['cloud-shade', 'M307 34L304 34L310 26ZM275 33L275 28L278 34Z'],
  ['cloud-lit', 'M275 28L275 33L274 30ZM274 30L275 33L272 31ZM317 18L310 18L314 15ZM310 18L317 18L318 20Z'],
  [
    'cloud-shade',
    'M300 29L300 35L300 35ZM304 34L300 35L300 29ZM311 33L307 34L310 26ZM315 33L318 27L320 32ZM318 27L315 33L310 26ZM315 33L311 33L310 26Z',
  ],
  ['sea-surface-lit', 'M346 98L324 55L346 54Z'],
  ['sea-surface', 'M312 75L324 55L346 98ZM312 75L291 98L275 79ZM291 98L264 98L275 79Z'],
  ['sea-surface-lit', 'M238 76L264 55L275 79Z'],
  ['sea-surface', 'M264 98L238 76L275 79Z'],
  ['sea-surface-lit', 'M238 76L230 55L264 55ZM238 76L204 98L204 55ZM230 55L238 76L204 55Z'],
  ['sea-surface', 'M295 55L324 55L312 75Z'],
  ['sea-surface-lit', 'M264 55L295 55L275 79Z'],
  ['sea-surface', 'M295 55L312 75L275 79ZM324 98L312 75L346 98ZM324 98L291 98L312 75Z'],
  ['sea-surface-lit', 'M238 76L228 98L204 98Z'],
  ['sea-surface', 'M228 98L238 76L264 98Z'],
  ['hull-lit', 'M206 85L344 83L344 96L206 96Z'],
  [
    'hull',
    'M206 76L344 74L344 76L206 78ZM218 75L219 75L219 85L218 85ZM241 75L242 75L242 85L241 85ZM264 75L265 75L265 85L264 85ZM287 75L288 75L288 85L287 85ZM310 75L311 75L311 85L310 85ZM333 75L334 75L334 85L333 85Z',
  ],
  ['steel-shade', 'M322 85L326 85L314 39L311 39Z'],
  ['steel-lit', 'M308 36L318 36L317 40L309 40Z'],
  ['frame-shade', 'M273 14L277 14L277 96L273 96Z'],
  ['pane-glint', 'M212 14L232 14L212 40Z'],
  ['steel-lit', 'M30 127L39 131L37 133L30 130Z'],
  [
    'steel-shade',
    'M39 131L43 140L40 140L37 133ZM43 140L39 149L37 147L40 140ZM39 149L30 153L30 150L37 147ZM30 153L21 149L23 147L30 150Z',
  ],
  ['steel-lit', 'M21 149L17 140L20 140L23 147ZM17 140L21 131L23 133L20 140ZM21 131L30 127L30 130L23 133Z'],
  ['house-lit', 'M30 140L30 130L37 133Z'],
  ['house', 'M30 140L37 133L40 140ZM30 140L40 140L37 147ZM30 140L37 147L30 150ZM30 140L30 150L23 147Z'],
  ['house-lit', 'M30 140L23 147L20 140ZM30 140L20 140L23 133ZM30 140L23 133L30 130Z'],
  ['cloth-dark', 'M29 140L27 145L31 141ZM29 140L30 131L31 140Z'],
];

/** The written procedure card the captain holds out on day 3, in room units. */
export const WRITTEN_CARD: readonly ArtFacet[] = [
  ['paper', 'M150 192L118 192L150 150Z'],
  ['paper-lit', 'M150 150L118 192L118 150Z'],
  ['paper-edge', 'M118 189L150 189L150 192L118 192ZM147 150L150 150L150 192L147 192Z'],
];
