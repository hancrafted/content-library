/*
 * The control-room wall of "Beside the skill", lifted from the approved Spec's Option 17a (feedback 3, decision 46):
 * the faceted wall and floor boards behind the two sheets, and the sheets' faceted paper with their tape and flat
 * drop, in the Spec's own units and tones (`slide.module.css`). The words on the sheets stay HTML.
 */

type Tone =
  | 'room'
  | 'room-lit'
  | 'room-shade'
  | 'floor'
  | 'floor-lit'
  | 'drop'
  | 'paper'
  | 'paper-lit'
  | 'paper-shade'
  | 'tape'
  | 'plan'
  | 'plan-lit'
  | 'plan-shade';
type Facets = readonly (readonly [Tone, string])[];

/** The control-room wall and its floor boards, as the Spec drew them: 600 by 420, the wall down to 380. */
const WALL: Facets = [
  ['room', 'M532 316L386 380L490 212Z'],
  ['room-shade', 'M532 316L600 228L600 380ZM600 228L532 316L490 212Z'],
  ['room', 'M342 101L228 0L371 0ZM342 101L536 72L490 212Z'],
  [
    'room-lit',
    'M165 108L342 101L258 179ZM342 101L165 108L228 0ZM536 72L459 0L600 0ZM459 0L342 101L371 0ZM342 101L459 0L536 72Z',
  ],
  ['room-shade', 'M600 145L536 72L600 0ZM600 145L600 228L490 212ZM536 72L600 145L490 212Z'],
  ['room', 'M212 380L325 290L386 380ZM386 380L325 290L490 212ZM342 101L325 290L258 179ZM325 290L342 101L490 212Z'],
  ['room-shade', 'M488 380L532 316L600 380ZM532 316L488 380L386 380Z'],
  ['room-lit', 'M165 108L114 0L228 0ZM114 0L0 102L0 0ZM0 102L114 0L62 158ZM114 0L165 108L62 158Z'],
  ['room', 'M69 285L129 380L0 380ZM0 250L69 285L0 380ZM0 250L0 102L62 158Z'],
  ['room-shade', 'M69 285L0 250L62 158Z'],
  ['room-lit', 'M129 380L191 267L212 380Z'],
  ['room', 'M69 285L191 267L129 380ZM325 290L191 267L258 179Z'],
  ['room-lit', 'M191 267L325 290L212 380Z'],
  ['room', 'M191 267L165 108L258 179ZM165 108L191 267L62 158Z'],
  ['room-shade', 'M191 267L69 285L62 158ZM0 373L600 373L600 380L0 380Z'],
  ['floor', 'M600 420L532 380L600 380Z'],
  ['floor-lit', 'M68 380L0 420L0 380ZM434 380L423 420L325 380Z'],
  ['floor', 'M273 380L244 420L172 380ZM244 420L161 420L172 380ZM161 420L68 380L172 380Z'],
  ['floor-lit', 'M423 420L325 420L325 380ZM325 420L273 380L325 380Z'],
  ['floor', 'M273 380L325 420L244 420ZM532 380L527 420L434 380ZM527 420L423 420L434 380Z'],
  ['floor-lit', 'M527 420L532 380L600 420ZM68 380L74 420L0 420ZM161 420L74 420L68 380Z'],
];

/** The skill's taped-up sheet, its shadow and folded corner, in the Spec's units. */
const SKILL_SHEET: Facets = [
  ['drop', 'M26.3 43.8L340.3 40L343.9 337L29.9 340.8Z'],
  ['paper-lit', 'M20.2 35.9L332.2 32.1L23.8 331.9Z'],
  ['paper', 'M332.2 32.1L335.8 328.1L23.8 331.9Z'],
  ['paper-shade', 'M313.8 328.4L335.5 310.1L335.8 328.1Z'],
  ['tape', 'M155 23L201 31L201 45L155 37Z'],
];

/** Today's dive plan: faceted paper, its ruled lines and its tape, in the Spec's units. */
const PLAN_SHEET: Facets = [
  ['drop', 'M370 78L596 78L596 309L370 309Z'],
  ['plan', 'M588 233L541.1 208.8L588 180.7ZM588 233L506.3 266.7L541.1 208.8Z'],
  ['plan-shade', 'M541.1 208.8L506.3 266.7L482.1 187.3Z'],
  [
    'plan-lit',
    'M442.8 126.9L424 70L462.2 70ZM424 70L364 126L364 70ZM364 126L424 70L442.8 126.9ZM497 103.9L442.8 126.9L462.2 70ZM442.8 126.9L497 103.9L482.1 187.3Z',
  ],
  ['plan', 'M364 242.7L418.2 300L364 300ZM441.7 234.4L364 242.7L364 198.1ZM441.7 234.4L418.2 300L364 242.7Z'],
  ['plan-shade', 'M506.3 266.7L441.7 234.4L482.1 187.3Z'],
  ['plan', 'M418.2 300L441.7 234.4L479.9 300ZM441.7 234.4L506.3 266.7L479.9 300Z'],
  ['plan-shade', 'M506.3 266.7L537.8 300L479.9 300ZM537.8 300L588 233L588 300ZM537.8 300L506.3 266.7L588 233Z'],
  [
    'plan-lit',
    'M364 126L395.2 173.2L364 198.1ZM395.2 173.2L364 126L442.8 126.9ZM395.2 173.2L441.7 234.4L364 198.1ZM395.2 173.2L442.8 126.9L482.1 187.3Z',
  ],
  ['plan', 'M441.7 234.4L395.2 173.2L482.1 187.3Z'],
  ['plan-lit', 'M521.1 70L497 103.9L462.2 70Z'],
  ['plan', 'M588 117.7L521.1 70L588 70Z'],
  ['plan-shade', 'M540.3 149.8L588 117.7L588 180.7ZM541.1 208.8L540.3 149.8L588 180.7Z'],
  ['plan', 'M540.3 149.8L521.1 70L588 117.7ZM521.1 70L540.3 149.8L497 103.9Z'],
  ['plan-shade', 'M540.3 149.8L541.1 208.8L482.1 187.3Z'],
  ['plan', 'M497 103.9L540.3 149.8L482.1 187.3Z'],
  ['plan-shade', 'M568 300L588 282L588 300Z'],
  ['tape', 'M450 66L502 60L502 74L450 80Z'],
];

function FacetPaths({ facets }: { readonly facets: Facets }) {
  return facets.map(([tone, d]) => <path key={d} d={d} data-tone={tone} vectorEffect="non-scaling-stroke" />);
}

/** The faceted wall and floor behind the sheets, stretched over the wall's box. Decoration only. */
export function WallArt({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 600 420" preserveAspectRatio="none" data-wall-art className={className}>
      <FacetPaths facets={WALL} />
    </svg>
  );
}

/** Each sheet's paper as the Spec cut it: its box in the Spec's units, so its tape and drop overhang the edges. */
const SHEETS = {
  skill: { facets: SKILL_SHEET, box: '20.2 32.1 315.6 299.8' },
  plan: { facets: PLAN_SHEET, box: '364 70 224 230' },
} as const;

/** One sheet's faceted paper, stretched behind its words; the tape and the drop overhang the sheet's box. */
export function SheetArt({ sheet, className }: { readonly sheet: keyof typeof SHEETS; readonly className?: string }) {
  const { facets, box } = SHEETS[sheet];
  return (
    <svg
      aria-hidden
      viewBox={box}
      preserveAspectRatio="none"
      overflow="visible"
      data-sheet-art={sheet}
      className={className}
    >
      <FacetPaths facets={facets} />
    </svg>
  );
}
