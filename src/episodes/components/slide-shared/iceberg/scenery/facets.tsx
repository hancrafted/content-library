import { Art } from '../../art/art';
import { artName } from '../../art/art.pure';
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

/** One facet of a drawing lifted from a Spec Option: its tone, then its outline. JSON rows type as plain arrays. */
export type ToneFacet = readonly string[];

interface ToneFacetsProps {
  readonly facets: readonly ToneFacet[];
  /**
   * The hook the Slide's token file colours by. `data-lp` keeps a lifted drawing's tones apart from the shared figures'
   * own `data-tone` parts, which a control-room Slide draws inside the same SVG.
   */
  readonly toneAttribute?: 'data-tone' | 'data-lp';
  /** Wraps the facets in `<g data-part>`, so a part can be found, moved or faded as one. */
  readonly part?: string;
  readonly className?: string;
}

/** Paints a lifted drawing's facets in paint order, each a path its Slide's token file colours by tone. */
export function ToneFacets({ facets, toneAttribute = 'data-tone', part, className }: ToneFacetsProps) {
  const paths = (
    <Art name={artName(part ?? 'facets', { facets, toneAttribute })} className={className}>
      {facets.map(([tone, d], index) => (
        <path key={index} {...{ [toneAttribute]: tone }} d={d} />
      ))}
    </Art>
  );
  return part === undefined ? paths : <g data-part={part}>{paths}</g>;
}
