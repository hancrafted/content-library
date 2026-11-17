import { Art } from '../../art/art';
import { artName } from '../../art/art.pure';
import type { FacetLayer } from './facet-data';

export function Facets({ layers }: { readonly layers: readonly FacetLayer[] }) {
  return (
    <>
      {layers.map((layer) => (
        <path key={`${layer.tone}:${layer.d.slice(0, 40)}`} data-tone={layer.tone} d={layer.d} />
      ))}
    </>
  );
}

export type ToneFacet = readonly string[];

interface ToneFacetsProps {
  readonly facets: readonly ToneFacet[];
  readonly toneAttribute?: 'data-tone' | 'data-lp';
  readonly part?: string;
  readonly className?: string;
}

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
