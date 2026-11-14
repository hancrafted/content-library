/*
 * Site 7's water in "Beside the skill", lifted from the approved Spec's Option 17a (feedback 3, decision 46): the sea
 * deepening from the Surface through Sunlit to Twilight, the sun's shafts, the seabed at 120 m and the waterline's
 * glow, in the Spec's own units and tones (`slide.module.css`). The sky, the ship and the robot stay the shared parts.
 */

type Tone =
  | 'sea-surface'
  | 'sea-surface-lit'
  | 'sea-sunlit'
  | 'sea-sunlit-lit'
  | 'sea-twilight'
  | 'sea-twilight-lit'
  | 'ray'
  | 'bed'
  | 'bed-lit'
  | 'bed-shade'
  | 'glow'
  | 'glow-soft';
type Facets = readonly (readonly [Tone, string])[];

/** The water at site 7, deepening from the Surface through Sunlit to Twilight, and the sun's shafts. */
const SEA: Facets = [
  [
    'sea-surface-lit',
    'M298 169L238 106L298 106ZM58 106L0 178L0 104ZM0 178L58 106L58 180ZM538 101L598 102L568 140ZM298 169L238 171L238 106Z',
  ],
  ['sea-surface', 'M238 171L178 106L238 106ZM178 106L238 171L178 174Z'],
  ['sea-surface-lit', 'M358 168L298 169L298 106Z'],
  ['sea-surface', 'M358 105L358 168L298 106Z'],
  ['sea-surface-lit', 'M87 143L58 106L118 107ZM58 106L87 143L58 180Z'],
  ['sea-surface', 'M87 143L118 176L58 180ZM178 106L150 139L118 107Z'],
  ['sea-surface-lit', 'M150 139L178 106L178 174ZM118 176L150 139L178 174Z'],
  [
    'sea-surface',
    'M150 139L87 143L118 107ZM87 143L150 139L118 176ZM598 176L538 170L568 140ZM598 102L598 176L568 140ZM600 177L598 176L600 101ZM598 176L598 102L600 101Z',
  ],
  ['sea-surface-lit', 'M507 135L538 101L568 140Z'],
  [
    'sea-surface',
    'M538 170L507 135L568 140ZM538 101L507 135L478 103ZM507 135L478 169L478 103ZM507 135L538 170L478 169Z',
  ],
  ['sea-surface-lit', 'M478 169L418 167L478 103Z'],
  ['sea-surface', 'M418 167L418 103L478 103Z'],
  ['sea-surface-lit', 'M418 167L358 168L358 105Z'],
  ['sea-surface', 'M418 103L418 167L358 105Z'],
  ['sea-sunlit-lit', 'M34 217L0 263L0 178ZM238 171L298 169L305 211Z'],
  ['sea-sunlit', 'M490 209L478 270L424 219Z'],
  ['sea-sunlit-lit', 'M478 169L490 209L424 219Z'],
  ['sea-sunlit', 'M358 266L298 264L305 211ZM363 211L358 266L305 211Z'],
  ['sea-sunlit-lit', 'M58 180L34 217L0 178ZM34 217L58 180L128 217Z'],
  [
    'sea-sunlit',
    'M58 180L118 176L128 217ZM58 262L34 217L128 217ZM118 261L58 262L128 217ZM34 217L58 262L0 263ZM538 170L566 233L490 209Z',
  ],
  ['sea-sunlit-lit', 'M478 169L538 170L490 209Z'],
  [
    'sea-sunlit',
    'M600 212L600 270L598 270ZM566 233L600 212L598 270ZM538 269L478 270L490 209ZM566 233L538 269L490 209ZM538 269L566 233L598 270Z',
  ],
  ['sea-sunlit-lit', 'M363 211L418 167L424 219ZM418 167L478 169L424 219ZM418 268L363 211L424 219Z'],
  ['sea-sunlit', 'M418 268L358 266L363 211Z'],
  ['sea-sunlit-lit', 'M478 270L418 268L424 219Z'],
  ['sea-sunlit', 'M298 264L238 262L305 211Z'],
  ['sea-sunlit-lit', 'M238 262L238 171L305 211ZM238 262L199 223L238 171ZM118 176L178 174L128 217Z'],
  ['sea-sunlit', 'M178 174L199 223L128 217ZM199 223L178 174L238 171Z'],
  ['sea-sunlit-lit', 'M538 170L598 176L566 233ZM598 176L600 212L566 233Z'],
  ['sea-sunlit', 'M600 212L598 176L600 177ZM358 168L418 167L363 211Z'],
  ['sea-sunlit-lit', 'M298 169L358 168L305 211Z'],
  ['sea-sunlit', 'M358 168L363 211L305 211Z'],
  ['sea-sunlit-lit', 'M238 262L178 258L199 223Z'],
  ['sea-sunlit', 'M178 258L118 261L128 217ZM199 223L178 258L128 217Z'],
  ['sea-twilight', 'M238 262L298 264L301 328ZM563 362L548 420L477 362ZM600 328L598 270L600 270Z'],
  ['sea-twilight-lit', 'M526 309L563 362L477 362ZM526 309L600 328L563 362Z'],
  ['sea-twilight', 'M526 309L598 270L600 328ZM600 328L600 374L563 362Z'],
  ['sea-twilight-lit', 'M548 420L600 374L600 420Z'],
  ['sea-twilight', 'M600 374L548 420L563 362ZM548 420L490 420L477 362Z'],
  ['sea-twilight-lit', 'M298 264L358 266L301 328ZM450 305L418 268L478 270ZM450 305L526 309L477 362Z'],
  ['sea-twilight', 'M526 309L450 305L478 270Z'],
  [
    'sea-twilight-lit',
    'M538 269L526 309L478 270ZM526 309L538 269L598 270ZM181 315L118 261L178 258ZM181 315L108 315L118 261ZM238 262L181 315L178 258ZM108 315L58 262L118 261ZM49 337L58 262L108 315ZM0 360L62 420L0 420Z',
  ],
  ['sea-twilight', 'M62 420L0 360L49 337Z'],
  ['sea-twilight-lit', 'M420 375L450 305L477 362Z'],
  ['sea-twilight', 'M420 375L490 420L411 420ZM490 420L420 375L477 362ZM314 420L244 348L301 328Z'],
  [
    'sea-twilight-lit',
    'M244 348L238 262L301 328ZM244 348L181 315L238 262ZM0 360L0 310L49 337ZM58 262L0 310L0 263ZM0 310L58 262L49 337Z',
  ],
  [
    'sea-twilight',
    'M105 385L49 337L108 315ZM105 385L62 420L49 337ZM361 376L367 420L314 420ZM361 376L314 420L301 328ZM367 420L361 376L411 420ZM361 376L420 375L411 420ZM227 420L244 348L314 420ZM105 385L126 420L62 420Z',
  ],
  ['sea-twilight-lit', 'M244 348L169 375L181 315Z'],
  ['sea-twilight', 'M126 420L169 375L182 420ZM169 375L126 420L105 385ZM181 315L169 375L108 315Z'],
  ['sea-twilight-lit', 'M169 375L105 385L108 315Z'],
  [
    'sea-twilight',
    'M169 375L227 420L182 420ZM227 420L169 375L244 348ZM391 317L358 266L418 268ZM361 376L391 317L420 375Z',
  ],
  ['sea-twilight-lit', 'M358 266L391 317L301 328Z'],
  ['sea-twilight', 'M391 317L361 376L301 328ZM450 305L391 317L418 268ZM420 375L391 317L450 305Z'],
  [
    'ray',
    'M45 106L56 106L105 264L98 264ZM157 106L178 106L221 264L208 264ZM288 106L308 106L351 264L339 264ZM408 106L429 106L472 264L460 264Z',
  ],
];

/** The seabed at 120 m. */
const BED: Facets = [
  ['bed', 'M37 399L23 372L47 373ZM325 381L331 404L293 382Z'],
  ['bed-shade', 'M26 420L37 399L54 420Z'],
  ['bed-lit', 'M37 399L0 399L23 372Z'],
  ['bed', 'M23 372L0 399L0 370ZM0 399L26 420L0 420Z'],
  ['bed-shade', 'M26 420L0 399L37 399Z'],
  ['bed-lit', 'M325 381L344 381L331 404Z'],
  ['bed-shade', 'M37 399L69 403L54 420Z'],
  ['bed', 'M69 403L37 399L47 373ZM68 375L69 403L47 373Z'],
  ['bed-lit', 'M425 399L420 378L447 377ZM393 379L425 399L391 420Z'],
  ['bed', 'M425 399L393 379L420 378Z'],
  ['bed-lit', 'M476 376L468 398L447 377Z'],
  ['bed', 'M468 398L425 399L447 377Z'],
  ['bed-shade', 'M425 399L468 398L445 420ZM374 405L361 420L331 404Z'],
  ['bed-lit', 'M344 381L374 405L331 404Z'],
  [
    'bed',
    'M374 405L344 381L372 380ZM361 420L374 405L391 420ZM374 405L393 379L391 420ZM393 379L374 405L372 380ZM96 376L120 378L101 398ZM69 403L96 376L101 398Z',
  ],
  ['bed-lit', 'M96 376L69 403L68 375Z'],
  ['bed-shade', 'M425 399L420 420L391 420ZM420 420L425 399L445 420ZM472 420L468 398L493 420ZM468 398L472 420L445 420Z'],
  ['bed-lit', 'M571 420L600 399L600 420ZM600 399L577 372L600 371ZM577 372L552 396L549 373Z'],
  ['bed-shade', 'M552 396L571 420L556 420Z'],
  ['bed', 'M600 399L552 396L577 372ZM552 396L600 399L571 420Z'],
  ['bed-shade', 'M527 420L552 396L556 420Z'],
  ['bed-lit', 'M549 373L552 396L521 374ZM552 396L527 420L521 374Z'],
  ['bed-shade', 'M501 401L527 420L493 420ZM527 420L501 401L521 374Z'],
  ['bed', 'M501 401L495 375L521 374ZM468 398L501 401L493 420Z'],
  ['bed-lit', 'M495 375L501 401L476 376ZM501 401L468 398L476 376Z'],
  ['bed-shade', 'M69 403L78 420L54 420ZM78 420L69 403L101 398Z'],
  [
    'bed-lit',
    'M108 420L78 420L101 398ZM120 378L131 397L101 398ZM149 379L131 397L120 378ZM331 404L314 420L293 382ZM314 420L291 420L293 382Z',
  ],
  ['bed-shade', 'M275 405L270 383L293 382Z'],
  ['bed', 'M291 420L275 405L293 382ZM270 383L275 405L251 382ZM171 401L149 379L176 380Z'],
  ['bed-shade', 'M190 380L171 401L176 380ZM131 397L171 401L157 420Z'],
  [
    'bed',
    'M171 401L131 397L149 379ZM125 420L108 420L101 398ZM131 397L125 420L101 398ZM125 420L131 397L157 420ZM361 420L342 420L331 404ZM342 420L314 420L331 404Z',
  ],
  ['bed-lit', 'M275 405L236 400L251 382ZM236 400L219 381L251 382Z'],
  ['bed', 'M262 420L236 400L275 405Z'],
  ['bed-shade', 'M236 400L262 420L235 420Z'],
  ['bed', 'M262 420L275 405L291 420Z'],
  ['bed-shade', 'M171 401L183 420L157 420Z'],
  ['bed', 'M204 400L171 401L190 380Z'],
  ['bed-shade', 'M204 400L183 420L171 401ZM183 420L204 400L204 420Z'],
  ['bed-lit', 'M204 400L190 380L219 381ZM236 400L204 400L219 381Z'],
  ['bed', 'M204 420L204 400L235 420Z'],
  ['bed-shade', 'M204 400L236 400L235 420Z'],
];

/** The waterline's glow. */
const GLOW: Facets = [
  ['glow-soft', 'M0 99L600 101L600 107L0 109Z'],
  ['glow', 'M6 103L594 103L594 105L6 105Z'],
];

function FacetPaths({ facets }: { readonly facets: Facets }) {
  return facets.map(([tone, d]) => <path key={d} d={d} data-tone={tone} vectorEffect="non-scaling-stroke" />);
}

/** The Spec's waterline and seabed line in its 600 by 420 dive, and where the Scene draws them. */
const SPEC = { width: 600, waterline: 104, bedTop: 370, bottom: 420 } as const;

export interface DiveWaterProps {
  /** The Scene's width, its waterline, the seabed's top and the Scene's floor, in the Scene's units. */
  readonly width: number;
  readonly waterline: number;
  readonly bedTop: number;
  readonly bottom: number;
}

/**
 * Site 7's water and seabed, stretched into the Scene: the sea's three zones from the waterline to the seabed's line,
 * the seabed from there to the Scene's floor, and the waterline's glow over both.
 */
export function DiveWater({ width, waterline, bedTop, bottom }: DiveWaterProps) {
  const sx = width / SPEC.width;
  const seaY = (bedTop - waterline) / (SPEC.bedTop - SPEC.waterline);
  const bedY = (bottom - bedTop) / (SPEC.bottom - SPEC.bedTop);
  return (
    <g data-dive-water>
      <g transform={`translate(0 ${waterline}) scale(${sx} ${seaY}) translate(0 ${-SPEC.waterline})`}>
        <FacetPaths facets={SEA} />
      </g>
      <g transform={`translate(0 ${bedTop}) scale(${sx} ${bedY}) translate(0 ${-SPEC.bedTop})`}>
        <FacetPaths facets={BED} />
      </g>
      <g transform={`translate(0 ${waterline}) scale(${sx} 1) translate(0 ${-SPEC.waterline})`}>
        <FacetPaths facets={GLOW} />
      </g>
    </g>
  );
}
