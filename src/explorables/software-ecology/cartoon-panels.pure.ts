/*
 * The tire swing cartoon's ten panels, line drawings in a 160 × 110 box, ported unchanged from the reference build's
 * `PANELS` (its 15-panels.js). A panel names the role it shows (`node`, matched against a work center's role and,
 * for the tiles, against the use case's node ids); words come from the config's `cartoon` keys by panel id. Only a
 * use case with `panels: true` shows them. Strokes are `currentColor`; `data-art` marks the parts the stylesheet fills.
 */

export interface CartoonPanel {
  /** The key of its caption in the config's `cartoon.captions`. */
  readonly id: string;
  /** The role (catalog id) it shows; the Customer panels have none. */
  readonly node?: string;
  /** The closing panel: what the customer really needed. */
  readonly target?: boolean;
  /** Documentation: the cartoon's empty frame, drawn by the view with its word. */
  readonly blank?: boolean;
  /** Support: the branch is broken. */
  readonly broken?: boolean;
  /** The panel's own strokes, SVG markup over the tree. */
  readonly art: string;
}

const CROWN =
  '<path d="M8 38 C0 28 8 12 22 15 C26 3 46 1 52 11 C64 7 74 17 68 29 C74 39 60 47 50 41 C42 49 24 49 18 43 C10 47 4 43 8 38 Z" data-art="muted" stroke-width="1.8" />';
const tree = (branch: boolean) =>
  `<path d="M8 104 H152" opacity=".3" /><path d="M24 104 C27 86 23 64 27 40" /><path d="M36 104 C33 86 37 64 35 40" />${branch ? '<path d="M40 30 C64 22 100 20 146 19" stroke-width="3.2" />' : '<path d="M40 30 C52 26 58 25 64 24" stroke-width="3.2" />'}${CROWN}`;
const tire = (cx: number, cy: number) => `<ellipse cx="${cx}" cy="${cy}" rx="15" ry="6" stroke-width="5" />`;

export const PANELS: readonly CartoonPanel[] = [
  {
    id: 'explained',
    art: '<path d="M74 19 V44 M104 18 V44" /><path d="M66 44 H112" /><path d="M74 44 V60 M104 44 V60" /><path d="M66 60 H112" /><path d="M74 60 V76 M104 60 V76" /><path d="M66 76 H112" />',
  },
  {
    id: 'pm',
    node: 'pm',
    art: '<path d="M86 18 V62" /><path d="M32 62 H100" stroke-width="4" /><path d="M32 54 V70" />',
  },
  {
    id: 'ba',
    node: 'ba',
    art: `<path d="M18 70 L42 64" stroke-width="1.6" stroke-dasharray="3 3" /><path d="M112 20 L114 104 M126 19 L124 104" /><path d="M76 21 V70 M98 20 V70" />${tire(87, 72)}`,
  },
  {
    id: 'eng',
    node: 'eng',
    art: `<path d="M76 19 V52 M100 18 V48" /><path d="M72 58 l6 -6 M96 52 l6 -4" stroke-dasharray="3 3" />${tire(88, 96)}`,
  },
  {
    id: 'sales',
    node: 'sales',
    art: '<path d="M72 19 V54 M106 18 V54" /><path d="M64 54 H114 V74 H64 Z" /><path d="M64 54 C60 44 70 40 72 54 M114 54 C118 44 108 40 106 54" /><path d="M70 74 V82 M108 74 V82" />',
  },
  { id: 'doc', node: 'doc', blank: true, art: '' },
  {
    id: 'ops',
    node: 'ops',
    art: '<path d="M78 19 V58 M98 18 V58" /><rect x="66" y="58" width="44" height="12" rx="6" /><path d="M72 64 h0.1 M104 64 h0.1" stroke-width="3" />',
  },
  {
    id: 'billing',
    node: 'billing',
    art: `<path d="M88 18 V60" />${tire(88, 66)}<path d="M104 30 L128 30 L134 40 L128 50 L104 50 Z" /><path d="M114 35 V45 M118 36 c-4 -2 -8 0 -4 4 c4 2 0 6 -4 4" stroke-width="1.6" />`,
  },
  {
    id: 'support',
    node: 'support',
    broken: true,
    art: `<path d="M64 24 L112 76" stroke-width="3.2" /><path d="M62 18 l6 4 -4 4 6 4" stroke-width="1.4" /><path d="M100 64 V82" />${tire(100, 88)}`,
  },
  { id: 'needed', target: true, art: `<path d="M88 18 V62" />${tire(88, 70)}` },
];

/** The Customer's own panel: how the customer explained it. */
export const CUSTOMER_PANEL = PANELS[0] as CartoonPanel;

/** The panel a node shows: the Customer's first, a work center's by its role. */
export const panelFor = (n: { kind: string; roleId: string }): CartoonPanel | undefined =>
  n.kind === 'customer' ? CUSTOMER_PANEL : PANELS.find((p) => p.node === n.roleId);

/** A panel's strokes: the tree, its branch whole or broken, and its own drawing. */
export const panelArt = (p: CartoonPanel): string => (p.blank ? '' : `${tree(!p.broken)}${p.art}`);

export const panelById = (id: string): CartoonPanel | undefined => PANELS.find((p) => p.id === id);
