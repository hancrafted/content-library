/**
 * The one prop a preset carries, as facet tables relative to the hand's grip (see `body-plan.ts`): at the side when the
 * figure stands, held forward when it holds.
 */
import type { FacetSpec } from './body-plan';
import type { Preset } from './preset';

export type PropPlace = 'side' | 'forward';

const move = (dx: number, dy: number, facets: readonly FacetSpec[]): FacetSpec[] =>
  facets.map(([group, id, tone, points]) => [group, id, tone, points.map((v, i) => v + (i % 2 === 0 ? dx : dy))]);

const MUG: readonly FacetSpec[] = [
  ['front-arm', 'prop', 'prop-shade', [-1.2, 2, -3, 2.5, -3, 6.5, -1.2, 7, -1.2, 6, -2, 5.6, -2, 3.4, -1.2, 3]],
  ['front-arm', 'prop', 'paper', [-1, 0, 3, 0, 3, 10, -0.6, 10]],
  ['front-arm', 'prop', 'prop-shade', [3, 0, 7, 0, 6.6, 10, 3, 10]],
  ['front-arm', 'prop', 'fill', [-1, 0, 7, 0, 6.4, 1.2, -0.6, 1.2]],
];

const CLIPBOARD: readonly FacetSpec[] = [
  ['front-arm', 'prop', 'prop', [0, 0, 12, -0.6, 12.8, 17, 0.6, 17.4]],
  ['front-arm', 'prop', 'prop-lit', [0, 0, 5, -0.2, 5.4, 17.2, 0.6, 17.4]],
  ['front-arm', 'prop', 'paper', [1.6, 2, 11, 1.5, 11.6, 15.6, 2, 16]],
  ['front-arm', 'prop', 'prop-shade', [3.4, 6, 9.6, 5.8, 9.6, 6.6, 3.4, 6.8]],
  ['front-arm', 'prop', 'prop-shade', [3.4, 9, 9.8, 8.8, 9.8, 9.6, 3.4, 9.8]],
  ['front-arm', 'prop', 'prop-shade', [3.6, -1.2, 8.6, -1.4, 8.6, 1.6, 3.6, 1.8]],
];

export const PROPS: Readonly<Record<NonNullable<Preset['prop']>, Readonly<Record<PropPlace, readonly FacetSpec[]>>>> = {
  mug: { side: move(1, 1, MUG), forward: move(-3, -11, MUG) },
  clipboard: { side: move(-3, -2, CLIPBOARD), forward: move(-2, -16, CLIPBOARD) },
  laptop: {
    side: [
      ['front-arm', 'prop', 'prop', [-5, 1, 13, 0, 13.4, 14, -4.6, 15]],
      ['front-arm', 'prop', 'prop-lit', [-5, 1, 4, 0.5, 4.4, 14.5, -4.6, 15]],
      ['front-arm', 'prop', 'prop-shade', [-4.6, 15, 13.4, 14, 13.4, 15.4, -4.6, 16.4]],
    ],
    forward: [
      ['front-arm', 'prop', 'prop-shade', [-1, -15, 17, -17, 17, -1, -1, 0]],
      ['front-arm', 'prop', 'screen', [0.6, -13.6, 15.4, -15.4, 15.4, -2.4, 0.6, -1.4]],
      ['front-arm', 'prop', 'screen-glow', [2.4, -11, 12, -12.2, 12, -11.2, 2.4, -10]],
      ['front-arm', 'prop', 'screen-glow', [2.4, -7.6, 9, -8.4, 9, -7.4, 2.4, -6.6]],
      ['front-arm', 'prop', 'prop-lit', [-3, 0, 19, -1.5, 21, 1.5, -1, 2.5]],
    ],
  },
};
