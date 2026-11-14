import type { FacetLayer } from './facet-data';

/** Paints a part's layers in order, each a path the scenery palette colours by its `data-tone`. */
export function Facets({ layers }: { readonly layers: readonly FacetLayer[] }) {
  return (
    <>
      {layers.map((layer) => (
        // A layer's path starts at its own first facet, so tone plus that start is unique within a part.
        <path key={`${layer.tone}:${layer.d.slice(0, 40)}`} data-tone={layer.tone} d={layer.d} />
      ))}
    </>
  );
}
