import type { ReactNode } from 'react';
import { Art } from '../art/art';
import { artName } from '../art/art.pure';
import styles from './ship.module.css';
import { pennantFacets, pointsAttr, shipAnchors, shipLayers, type ShipFacet } from './ship.pure';

export interface ShipProps {
  readonly flip?: boolean;
  readonly transform?: string;
  readonly bridge?: ReactNode;
  readonly deck?: ReactNode;
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

const ROCKING = { 'data-motion': 'ambient', className: styles.rock } as const;

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
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
