/*
 * The water of "grill-with-docs keeps context beside the skill", lifted from the approved Spec's Option 19b (feedback
 * 3, decision 46): the faceted read-back current with its bubbles, and the Twilight water's light shafts and seabed,
 * in the Spec's own units and tones (`slide.module.css`). The Twilight water and its jellies stay the shared
 * `ZoneScene`.
 */

type Tone = 'current' | 'current-lit' | 'bubble' | 'glint' | 'ray' | 'bed' | 'bed-lit' | 'bed-shade';
type Facets = readonly (readonly [Tone, string])[];

/** The light shafts slanting through the Twilight water. */
const RAY: Facets = [
  [
    'ray',
    'M22 0L39 0L220 546L210 546ZM179 0L200 0L378 546L366 546ZM339 0L354 0L536 546L528 546ZM472 0L483 0L668 546L661 546Z',
  ],
];

/** The seabed along the bottom of the Scene. */
const BED: Facets = [
  ['bed', 'M1002 782L984 764L1002 763ZM746 748L780 748L748 782Z'],
  ['bed-shade', 'M100 762L63 782L66 760Z'],
  ['bed-lit', 'M965 782L984 764L1002 782Z'],
  ['bed-shade', 'M965 782L929 782L950 760ZM984 764L965 782L950 760Z'],
  ['bed-lit', 'M780 748L791 782L748 782Z'],
  ['bed', 'M820 782L791 782L814 751Z'],
  ['bed-lit', 'M791 782L780 748L814 751ZM916 756L929 782L890 782Z'],
  ['bed-shade', 'M882 753L916 756L890 782Z'],
  ['bed-lit', 'M929 782L916 756L950 760Z'],
  ['bed-shade', 'M853 782L882 753L890 782Z'],
  ['bed-lit', 'M722 782L746 748L748 782Z'],
  ['bed', 'M610 756L644 756L644 782Z'],
  ['bed-lit', 'M644 756L674 782L644 782ZM644 756L678 750L674 782Z'],
  ['bed', 'M603 782L610 756L644 782Z'],
  ['bed-shade', 'M32 762L-2 782L-2 761Z'],
  ['bed', 'M134 762L168 754L149 782Z'],
  ['bed-lit', 'M100 762L102 782L63 782ZM102 782L134 762L149 782ZM134 762L102 782L100 762Z'],
  ['bed-shade', 'M314 782L280 782L304 744Z'],
  ['bed', 'M204 782L236 751L242 782ZM848 750L853 782L820 782Z'],
  ['bed-shade', 'M848 750L820 782L814 751Z'],
  ['bed-lit', 'M853 782L848 750L882 753Z'],
  ['bed', 'M474 760L508 760L507 782ZM508 760L531 782L507 782Z'],
  ['bed-shade', 'M576 758L603 782L570 782ZM603 782L576 758L610 756Z'],
  ['bed', 'M372 752L406 752L400 782Z'],
  ['bed-shade', 'M712 749L722 782L674 782Z'],
  ['bed-lit', 'M678 750L712 749L674 782Z'],
  ['bed', 'M722 782L712 749L746 748ZM32 762L42 782L-2 782Z'],
  ['bed-shade', 'M63 782L42 782L66 760Z'],
  ['bed', 'M42 782L32 762L66 760Z'],
  ['bed-lit', 'M280 782L270 747L304 744ZM270 747L280 782L242 782Z'],
  ['bed', 'M236 751L270 747L242 782Z'],
  ['bed-shade', 'M168 754L168 782L149 782Z'],
  ['bed-lit', 'M204 782L202 752L236 751Z'],
  ['bed', 'M168 782L202 752L204 782ZM202 752L168 782L168 754ZM458 782L474 760L507 782Z'],
  ['bed-shade', 'M474 760L458 782L440 754ZM531 782L542 760L570 782Z'],
  ['bed', 'M542 760L576 758L570 782Z'],
  ['bed-shade', 'M542 760L531 782L508 760Z'],
  ['bed-lit', 'M355 782L372 752L400 782Z'],
  ['bed-shade', 'M458 782L435 782L440 754Z'],
  [
    'bed',
    'M435 782L406 752L440 754ZM406 752L435 782L400 782ZM338 747L355 782L314 782ZM338 747L314 782L304 744ZM355 782L338 747L372 752Z',
  ],
  ['bed-lit', 'M900 762L886 762L900 756ZM826 751L830 762L820 762ZM853 751L843 737L852 732Z'],
  ['bed-shade', 'M853 751L867 745L866 762ZM852 762L853 751L866 762ZM852 762L842 762L853 751Z'],
  ['bed-lit', 'M843 737L840 751L830 744ZM840 751L843 737L853 751Z'],
  ['bed-shade', 'M842 762L840 751L853 751ZM840 751L826 751L830 744ZM840 751L842 762L830 762Z'],
  ['bed-lit', 'M826 751L840 751L830 762Z'],
  ['bed-shade', 'M867 745L879 750L866 762ZM879 750L867 745L880 737Z'],
  ['bed-lit', 'M863 734L853 751L852 732ZM863 734L867 745L853 751ZM867 745L863 734L880 737ZM879 750L877 762L866 762Z'],
  ['bed-shade', 'M877 762L879 750L886 762ZM886 762L888 744L900 756ZM879 750L888 744L886 762Z'],
  ['bed-lit', 'M888 744L879 750L880 737Z'],
];

/** The read-back current, faceted, and the bubbles rising beside its start. */
const CURRENT: Facets = [
  ['current-lit', 'M441 566L460 568L458 584Z'],
  ['current', 'M441 566L458 584L439 582ZM457 568L474 564L478 580Z'],
  ['current-lit', 'M457 568L478 580L461 584ZM471 565L486 555L495 569Z'],
  ['current', 'M471 565L495 569L480 579ZM484 557L497 541L509 551Z'],
  ['current-lit', 'M484 557L509 551L497 567ZM496 543L506 521L521 527Z'],
  ['current', 'M496 543L521 527L510 549ZM506 522L514 494L529 498Z'],
  ['current-lit', 'M506 522L529 498L521 526ZM514 495L520 461L536 463Z'],
  ['current', 'M514 495L536 463L530 497ZM520 461L524 421L540 423Z'],
  ['current-lit', 'M520 461L540 423L536 463ZM546 406L542 432L522 416Z'],
  ['bubble', 'M504 680L502 684L498 684L496 680L498 677L502 677Z'],
  ['glint', 'M498 679L500 677L500 679Z'],
  ['bubble', 'M509 652L508 655L505 655L503 652L505 649L508 649Z'],
  ['glint', 'M505 651L506 650L506 651Z'],
  ['bubble', 'M500 628L499 630L497 630L496 628L497 626L499 626Z'],
  ['glint', 'M497 628L498 626L498 628Z'],
];

function FacetPaths({ facets }: { readonly facets: Facets }) {
  return facets.map(([tone, d]) => <path key={d} d={d} data-tone={tone} vectorEffect="non-scaling-stroke" />);
}

/** The current's box in the Spec's units, from Monday's files up to Thursday's run, its bubbles below. */
export const CURRENT_BOX = '436 402 112 284';

/** The faceted read-back current and its bubbles, in the Spec's units: draw it in `CURRENT_BOX`. */
export function CurrentArt() {
  return <FacetPaths facets={CURRENT} />;
}

/** The Spec's Scene, 1000 by 780; the Episode's is 1200 by 800, filled from the bottom. */
const SPEC = { width: 1000, height: 780 } as const;

/** The Twilight water's light shafts and the seabed, scaled from the Spec's Scene into `ZoneScene`'s, bottoms level. */
export function TwilightFloor({ width, height }: { readonly width: number; readonly height: number }) {
  const scale = width / SPEC.width;
  return (
    <g data-twilight-floor transform={`translate(0 ${height}) scale(${scale}) translate(0 ${-SPEC.height})`}>
      <FacetPaths facets={RAY} />
      <FacetPaths facets={BED} />
    </g>
  );
}
