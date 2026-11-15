import type { ReactNode } from 'react';
import { Art } from '../art/art';
import { artName } from '../art/art.pure';
import styles from './ship.module.css';
import { pennantFacets, pointsAttr, shipAnchors, shipLayers, type ShipFacet } from './ship.pure';

export interface ShipProps {
  /** Bow to the left instead of the right. Mirror the anchors with `shipAnchors(true)` to match. */
  readonly flip?: boolean;
  /** Places the ship in the Scene's `<svg>`; (0, 0) is the waterline amidships. */
  readonly transform?: string;
  /**
   * Figures on the bridge, placed at `shipAnchors().bridge`. The window frame is drawn over them, so they show only
   * through the glass, and the ship's rock carries them.
   */
  readonly bridge?: ReactNode;
  /**
   * Figures on deck: crew at `shipAnchors().deck`, the robot at `shipAnchors().robot`. Drawn in front of the deck house
   * and behind the rail, and carried by the rock.
   */
  readonly deck?: ReactNode;
  /**
   * Rock on the swell: the Surface zone's ambient loop, so only a Surface Slide passes it. It plays only while the
   * Slide's mount is `[data-zone="active"]`, never under reduced motion, and rests level. Off by default, so a ship
   * placed anywhere else stays still.
   */
  readonly rock?: boolean;
}

const Polygons = ({ facets }: { readonly facets: readonly ShipFacet[] }) =>
  facets.map(({ points, tone }, index) => (
    <polygon key={`${tone}-${index}`} data-tone={tone} points={pointsAttr(points)} className={styles[tone]} />
  ));

const Facets = ({ facets, layer }: { readonly facets: readonly ShipFacet[]; readonly layer: string }) => (
  <g data-layer={layer}>
    <Art name={artName(`ship/${layer}`, facets)}>
      <Polygons facets={facets} />
    </Art>
  </g>
);

/** The pennant at the masthead; with the rock, the wind flutters it too. */
function Pennant({ flip, wind }: { readonly flip: boolean; readonly wind: boolean }) {
  const { x, y } = shipAnchors(flip).pennant;
  return (
    <g data-pennant transform={`translate(${x} ${y})`}>
      <g {...(wind ? { 'data-motion': 'ambient', className: styles.flutter } : {})}>
        <Art name={`ship/pennant${flip ? '-flip' : ''}`}>
          <Polygons facets={pennantFacets(flip)} />
        </Art>
      </g>
    </g>
  );
}

/** The rock's hooks: the ambient-loop marker and the class that plays it under `[data-zone="active"]`. */
const ROCKING = { 'data-motion': 'ambient', className: styles.rock } as const;

/**
 * Frozen interface (decisions 15–17 of feedback 2; pinned by `ship.test.ts`, `ship.pure.test.ts` and the scenery's
 * `fable-elements.slow.test.ts`). A Fable redraw changes only the facet rows in `ship-facets.pure.ts` and
 * `ship.module.css`, keeping `DECK`, `WINDOW`, `MASTHEAD` and the A-frame tip where the anchors put them.
 *
 * - Props: `flip`, `transform`, `bridge`, `deck`, `rock`, as typed in `ShipProps`.
 * - Box: (0, 0) is the waterline amidships; the ship stays within x -190 to 190, y -185 to 30.
 * - Anchors: `shipAnchors()` (bridge seats, deck, robot cradle, A-frame tip, masthead), mirrored when flipped.
 * - Hooks: root `data-ship`; paint layers `data-layer` = `hull`, `superstructure`, `rail`; slots `data-slot` =
 *   `bridge`, `deck`; `data-pennant` at the masthead.
 * - Tokens it mixes from: `--info`, `--brand-accent`, `--bulb`, `--on-brand-accent`, `--overlay`.
 * - Motion: with `rock` only, the rock and the pennant's flutter, each `data-motion="ambient"`, under
 *   `[data-zone='active']` only and never under reduced motion; transform and opacity only (decision 19).
 */
/**
 * The research ship at the waterline, after the approved Spec's low-poly ship: hull, deck house with the bridge,
 * funnel, mast with its pennant, the A-frame and winch at the stern (design-ADR 0025, "Scene figures are deep modules"). It draws no
 * people and no robot: a Scene passes them in as `bridge` and `deck` figures at the ship's anchors (`shipAnchors`), so
 * people stay with `Character`. Its one motion is the Surface zone's ambient rock, opt-in through `rock`, played only
 * while its Slide is active and resting level, so a still frame and reduced motion show the ship upright.
 */
export function Ship({ flip = false, transform, bridge, deck, rock = false }: ShipProps) {
  const layers = shipLayers(flip);
  return (
    <g data-ship data-flip={flip ? '' : undefined} transform={transform} className={styles.ship}>
      <g {...(rock ? ROCKING : {})}>
        <Facets facets={layers.hull} layer="hull" />
        {bridge === undefined ? null : <g data-slot="bridge">{bridge}</g>}
        <Facets facets={layers.superstructure} layer="superstructure" />
        <Pennant flip={flip} wind={rock} />
        {deck === undefined ? null : <g data-slot="deck">{deck}</g>}
        <Facets facets={layers.rail} layer="rail" />
      </g>
    </g>
  );
}
