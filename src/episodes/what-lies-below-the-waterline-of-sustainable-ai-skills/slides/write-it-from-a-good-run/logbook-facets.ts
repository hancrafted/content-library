/*
 * The notes lane's picture, lifted facet by facet from Spec Option 10b (feedback 3, decision 46), in the Spec's 330 by
 * 176 units: three logbook pages pinned to the faceted wall, and on the chart table under them the open logbook, a
 * pencil and a loose page. The Spec's paper shadows (`drop`) are left out (decision 19).
 */

import type { ArtTone } from './room-facets';

/** The picture's drawing space, the Spec's. */
export const LOGBOOK_ART = { width: 330, height: 176 } as const;

/** Where each pinned page's date sits, in the picture's units, and its tilt; the dates are the Slide's words. */
export const PAGE_DATES = [
  { x: 22, y: 38, tilt: -3 },
  { x: 124, y: 40, tilt: 2 },
  { x: 226, y: 38, tilt: 0 },
] as const;

/** The tones the room has, plus the chart table's wood, the pencil and the logbook's cover. */
export type LogbookTone = ArtTone | 'wood-lit' | 'wood' | 'wood-shade' | 'pencil' | 'cover' | 'cover-shade';

export type LogbookFacet = readonly [tone: LogbookTone, d: string];

export const LOGBOOK: readonly LogbookFacet[] = [
  ['room', 'M60 84L165 45L141 121Z'],
  ['room-shade', 'M0 107L66 176L0 176ZM66 176L0 107L60 84Z'],
  ['room-lit', 'M126 176L66 176L141 121Z'],
  ['room', 'M66 176L60 84L141 121Z'],
  ['room-lit', 'M267 176L330 113L330 176Z'],
  ['room', 'M203 176L126 176L141 121ZM0 107L0 51L60 84Z'],
  ['room-lit', 'M61 0L0 51L0 0Z'],
  ['room', 'M0 51L61 0L60 84ZM61 0L135 0L60 84Z'],
  ['room-lit', 'M135 0L165 45L60 84ZM165 45L135 0L191 0ZM252 95L165 45L191 0Z'],
  ['room-shade', 'M330 113L252 95L330 68ZM252 95L330 113L267 176ZM203 176L252 95L267 176Z'],
  ['room-lit', 'M165 45L252 95L141 121Z'],
  ['room-shade', 'M252 95L203 176L141 121Z'],
  ['room', 'M255 0L252 95L191 0ZM330 68L255 0L330 0ZM252 95L255 0L330 68Z'],
  ['paper-lit', 'M10 14L102 10L14 98Z'],
  ['paper', 'M102 10L106 94L14 98Z'],
  ['paper-shade', 'M94 94L105 82L106 94Z'],
  [
    'paper-rule',
    'M17 38L86 34L86 36L17 39ZM18 50L74 47L74 49L18 52ZM18 63L82 60L82 61L19 64ZM19 75L63 73L63 75L19 77Z',
  ],
  ['pin', 'M55 8L61 8L60 16L56 16Z'],
  ['paper-lit', 'M115 15L207 17L113 99Z'],
  ['paper', 'M207 17L205 101L113 99Z'],
  ['paper-shade', 'M193 101L205 89L205 101Z'],
  [
    'paper-rule',
    'M121 38L189 40L189 42L121 40ZM120 51L176 53L176 54L120 53ZM120 64L184 65L184 67L120 65ZM119 76L163 77L163 79L119 78Z',
  ],
  ['pin', 'M157 8L163 8L162 16L158 16Z'],
  ['paper-lit', 'M215 13L307 11L217 97Z'],
  ['paper', 'M307 11L309 95L217 97Z'],
  ['paper-shade', 'M297 95L309 83L309 95Z'],
  [
    'paper-rule',
    'M222 36L290 35L291 37L222 38ZM222 49L278 48L278 49L222 51ZM222 62L286 60L286 62L222 63ZM222 74L266 73L266 75L222 76Z',
  ],
  ['pin', 'M259 8L265 8L264 16L260 16Z'],
  ['wood-lit', 'M20 140L310 138L314 148L16 149Z'],
  ['wood-shade', 'M16 149L314 148L312 156L18 156Z'],
  ['wood', 'M28 156L36 156L36 176L28 176Z'],
  ['wood-shade', 'M294 156L302 156L302 176L294 176Z'],
  ['cover-shade', 'M113 107L273 107L275 142L111 142Z'],
  ['cover', 'M113 107L193 110L111 142Z'],
  ['paper-lit', 'M118 104L193 108L193 138L118 135Z'],
  ['paper', 'M193 108L268 104L268 135L193 138Z'],
  ['paper-shade', 'M191 108L195 108L195 138L191 138Z'],
  [
    'paper-rule',
    'M124 114L187 115L187 116L124 115ZM124 117L179 118L179 120L124 119ZM124 120L171 121L171 123L124 122ZM124 124L187 125L187 126L124 125ZM124 127L179 128L179 129L124 128ZM199 114L262 113L262 114L199 115ZM199 117L254 116L254 118L199 119ZM199 120L246 119L246 121L199 122ZM199 124L262 123L262 124L199 125ZM199 127L254 126L254 127L199 128Z',
  ],
  ['pencil', 'M203 132L278 112L280 116L205 136Z'],
  ['wood-lit', 'M278 112L286 108L280 116Z'],
  ['paper-lit', 'M42 109L97 115L39 137Z'],
  ['paper', 'M97 115L95 143L39 137Z'],
  ['paper-shade', 'M83 142L96 132L95 143Z'],
  ['paper-rule', 'M47 118L84 122L84 123L47 119ZM46 126L77 129L76 131L46 128Z'],
];
