import type { ReactNode } from 'react';
import styles from './ship.module.css';
import { pointsAttr, shipLayers, type ShipFacet } from './ship.pure';

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
}

const Facets = ({ facets, layer }: { readonly facets: readonly ShipFacet[]; readonly layer: string }) => (
  <g data-layer={layer}>
    {facets.map(({ points, tone }, index) => (
      <polygon key={`${tone}-${index}`} data-tone={tone} points={pointsAttr(points)} className={styles[tone]} />
    ))}
  </g>
);

/**
 * The research ship at the waterline, after the approved Spec's low-poly ship: hull, deck house with the bridge,
 * funnel, mast, the A-frame and winch at the stern (design-ADR 0025, "Scene figures are deep modules"). It draws no
 * people and no robot: a Scene passes them in as `bridge` and `deck` figures at the ship's anchors (`shipAnchors`), so
 * people stay with `Character`. Its one motion is the Surface zone's ambient rock, played only while its Slide is
 * active and resting level, so a still frame and reduced motion show the ship upright.
 */
export function Ship({ flip = false, transform, bridge, deck }: ShipProps) {
  const layers = shipLayers(flip);
  return (
    <g data-ship data-flip={flip ? '' : undefined} transform={transform} className={styles.ship}>
      <g data-motion="ambient" className={styles.rock}>
        <Facets facets={layers.hull} layer="hull" />
        {bridge === undefined ? null : <g data-slot="bridge">{bridge}</g>}
        <Facets facets={layers.superstructure} layer="superstructure" />
        {deck === undefined ? null : <g data-slot="deck">{deck}</g>}
        <Facets facets={layers.rail} layer="rail" />
      </g>
    </g>
  );
}
