/*
 * The Surface sky (feedback 3, decision 41, which turns decision 8's flat sky into the Spec's Option 0a): a few large,
 * soft, low-contrast facets in three bands, darker at the top and lighter towards the horizon, each band in two
 * neighbouring tones. The bands meet on uneven waves from the same generator the zones under the waterline use. The
 * tones are the one place the sky's colours are mixed, so a Surface title's transition wave takes the very top tone.
 */
import { bandFacets, zoneEdge, type ZoneEdge } from '../zone-edges.pure';
import { seededRandom } from './scenery.pure';

/** The sky's four tones, from the top down. */
export const SKY_TONES = ['sky-1', 'sky-2', 'sky-3', 'sky-4'] as const;
export type SkyTone = (typeof SKY_TONES)[number];

/** How much of the Surface zone's colour each tone keeps, the rest the info blue: close steps, so facets stay soft. */
const SURFACE_SHARE: Readonly<Record<SkyTone, number>> = { 'sky-1': 64, 'sky-2': 71, 'sky-3': 79, 'sky-4': 87 };

/** A sky tone by day, mixed from global tokens only (FE-011). */
export function skyColour(tone: SkyTone): string {
  return `color-mix(in oklab, var(--zone-surface) ${SURFACE_SHARE[tone]}%, var(--info))`;
}

/** The colour at the very top of the sky, which a Surface title's transition wave takes (feedback 3, decision 48). */
export function skyTop(): string {
  return skyColour('sky-1');
}

/** One facet of the sky. */
export interface SkyFacet {
  readonly points: string;
  readonly tone: SkyTone;
}

export interface SkyOptions {
  readonly left: number;
  readonly width: number;
  /** From the top of the drawing down to the waterline. */
  readonly height: number;
  /** How far the top band runs on above the drawing, for a drawing moved down its box: 0 by default. */
  readonly rise?: number;
  readonly seed: number;
}

/** Where the bands meet, as shares of the sky's height, as the Spec's sky steps. */
const BAND_EDGES = [0.36, 0.68] as const;
/** A facet's cell, long and low like the Spec's streaked sky. */
const SKY_CELL = { width: 300, height: 80 } as const;
/** How far a band boundary waves, as a share of the sky's height. */
const WAVE = 0.05;

/**
 * The sky over `width` from `left`, the top of the drawing to the waterline: three bands between uneven boundaries,
 * each cut into long facets, each facet one of its band's two neighbouring tones by the seed. The top and the
 * waterline stay straight, so the sky meets the drawing's edge and the lit waterline without a gap; with a `rise`,
 * the top band runs on that far above the drawing, so the drawing's top edge still shows the top two tones.
 */
export function skyFacets({ left, width, height, rise = 0, seed }: SkyOptions): readonly SkyFacet[] {
  if (!(height > 0) || !(width > 0)) throw new Error(`A sky needs a positive size, got ${width} by ${height}.`);
  const right = left + width;
  const edges: readonly ZoneEdge[] = [
    zoneEdge({ left, right, y: -rise, amplitude: 0, seed }),
    ...BAND_EDGES.map((share, index) =>
      zoneEdge({ left, right, y: share * height, amplitude: WAVE * height, seed: seed + 17 * (index + 1) }),
    ),
    zoneEdge({ left, right, y: height, amplitude: 0, seed }),
  ];
  const random = seededRandom(seed + 101);
  return edges.slice(0, -1).flatMap((top, band) => {
    const tones = [SKY_TONES[band]!, SKY_TONES[band + 1]!] as const;
    return bandFacets({ left, width, top, bottom: edges[band + 1]!, cell: SKY_CELL, seed: seed + band }).map(
      ({ points }) => ({ points, tone: tones[random() < 0.5 ? 0 : 1] }),
    );
  });
}
