/**
 * The torso of the one human body plan, per outfit, as facet tables (see `body-plan.ts`). `b` widens the shoulders by
 * build; the officer's jacket follows the Spec's woman captain (`woman.py`), the flight jacket and the freelancer's
 * sweater share its cut.
 */
import type { FacetSpec } from './body-plan';
import type { Preset } from './preset';

/** How far each build moves the shoulders out from the average. */
export const BUILD_WIDTH: Readonly<Record<Preset['build'], number>> = { slim: -1, average: 0, broad: 2.5 };

function base(b: number, hem: number): FacetSpec[] {
  const h = b / 2;
  return [
    ['body', 'neck', 'skin-shade', [-3, -77, 4, -77, 3, -70, -3, -70]],
    ['body', 'torso', 'top-lit', [-14 - b, -71, -1, -72, -2, -54, -11 - h, -52]],
    ['body', 'torso', 'top', [-1, -72, 13 + b, -70, 10 + h, -54, -2, -54]],
    ['body', 'torso', 'top', [-11 - h, -52, -2, -54, 10 + h, -54, 12 + h, hem, -12 - h, hem]],
    ['body', 'torso', 'top-lit', [-11 - h, -52, -2, -54, -12 - h, hem]],
    ['body', 'torso', 'top-shade', [5, -70, 13 + b, -70, 10 + h, -54, 12 + h, hem, 6, hem - 2, 6, -54]],
  ];
}

const button = (x: number, y: number): FacetSpec => [
  'body',
  'button',
  'trim',
  [x, y, x + 1.5, y - 1.5, x + 3, y, x + 1.5, y + 1.5],
];

const officer = (b: number): FacetSpec[] => [
  ...base(b, -38),
  ['body', 'collar', 'collar', [-4, -72, 4, -72, 0, -62]],
  ['body', 'lapel', 'top-shade', [-4, -72, 0, -62, -3, -56, -6, -68]],
  ['body', 'lapel', 'top-shade', [4, -72, 7, -68, 3, -58, 0, -62]],
  ...[-53, -46].flatMap((y) => [button(-3, y), button(4, y)]),
  ['body', 'epaulette', 'dark', [4, -73, 15 + b, -71, 15 + b, -68, 4, -70]],
  ['body', 'epaulette', 'trim', [6, -72.3, 14 + b, -70.8, 14 + b, -70, 6, -71.5]],
  ['body', 'epaulette', 'trim', [6, -71, 14 + b, -69.5, 14 + b, -68.8, 6, -70.2]],
];

const pilotJacket = (b: number): FacetSpec[] => [
  ...base(b, -38),
  ['body', 'collar', 'collar', [-3, -72, 4, -72, 0.5, -64]],
  ['body', 'lapel', 'top-lit', [-6, -73, -3, -72, 0.5, -64, -4, -66]],
  ['body', 'lapel', 'top-shade', [4, -72, 9, -72, 5, -65, 0.5, -64]],
  ['body', 'zip', 'top-shade', [0, -64, 1, -64, 1.4, -38, 0.4, -38]],
  ['body', 'pocket', 'top-shade', [3.5, -60, 9, -60, 9, -55, 3.5, -55]],
  ['body', 'waistband', 'top-shade', [-12 - b / 2, -42, 12 + b / 2, -42, 12 + b / 2, -38, -12 - b / 2, -38]],
];

const freelancer = (b: number): FacetSpec[] => [
  ...base(b, -36),
  ['body', 'hood', 'top-shade', [-11, -74, -3, -73, -4, -69, -10, -66, -14, -70]],
  ['body', 'collar', 'collar', [-3, -72, 4, -72, 3, -69, -2, -69]],
  ['body', 'hem', 'top-shade', [-12 - b / 2, -39, 12 + b / 2, -39, 12 + b / 2, -36, -12 - b / 2, -36]],
];

const OUTFITS: Readonly<Record<Preset['outfit'], (b: number) => FacetSpec[]>> = {
  officer,
  'pilot-jacket': pilotJacket,
  freelancer,
};

/** The `kind: 'ai'` mark: one tag in the `ai` meaning colour on the chest, with a glint. */
const AI_BADGE: readonly FacetSpec[] = [
  ['body', 'ai-tag', 'ai-tag', [3, -63, 9, -63.4, 9.2, -57.4, 3.2, -57]],
  ['body', 'ai-tag-glint', 'glint', [4, -61.6, 8.2, -61.9, 8.2, -61.1, 4, -60.8]],
];

/** The neck and torso a preset wears, and the ai tag when it is an AI agent. */
export function torsoFacets(preset: Preset): FacetSpec[] {
  const facets = OUTFITS[preset.outfit](BUILD_WIDTH[preset.build]);
  return preset.kind === 'ai' ? [...facets, ...AI_BADGE] : facets;
}
