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
  ['drop', 'M26 44L340 40L344 337L30 341Z'],
  ['paper-lit', 'M20 36L332 32L24 332Z'],
  ['paper', 'M332 32L336 328L24 332Z'],
  ['paper-shade', 'M314 328L336 310L336 328Z'],
  ['tape', 'M155 23L201 31L201 45L155 37Z'],
];

/** Today's dive plan: faceted paper, its ruled lines and its tape, in the Spec's units. */
const PLAN_SHEET: Facets = [
  ['drop', 'M370 78L596 78L596 309L370 309Z'],
  ['plan', 'M588 233L541 209L588 181ZM588 233L506 267L541 209Z'],
  ['plan-shade', 'M541 209L506 267L482 187Z'],
  [
    'plan-lit',
    'M443 127L424 70L462 70ZM424 70L364 126L364 70ZM364 126L424 70L443 127ZM497 104L443 127L462 70ZM443 127L497 104L482 187Z',
  ],
  ['plan', 'M364 243L418 300L364 300ZM442 234L364 243L364 198ZM442 234L418 300L364 243Z'],
  ['plan-shade', 'M506 267L442 234L482 187Z'],
  ['plan', 'M418 300L442 234L480 300ZM442 234L506 267L480 300Z'],
  ['plan-shade', 'M506 267L538 300L480 300ZM538 300L588 233L588 300ZM538 300L506 267L588 233Z'],
  ['plan-lit', 'M364 126L395 173L364 198ZM395 173L364 126L443 127ZM395 173L442 234L364 198ZM395 173L443 127L482 187Z'],
  ['plan', 'M442 234L395 173L482 187Z'],
  ['plan-lit', 'M521 70L497 104L462 70Z'],
  ['plan', 'M588 118L521 70L588 70Z'],
  ['plan-shade', 'M540 150L588 118L588 181ZM541 209L540 150L588 181Z'],
  ['plan', 'M540 150L521 70L588 118ZM521 70L540 150L497 104Z'],
  ['plan-shade', 'M540 150L541 209L482 187Z'],
  ['plan', 'M497 104L540 150L482 187Z'],
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
