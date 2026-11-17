import { bandFacets, zoneEdge, type ZoneEdge } from '../zone-edges.pure';
import { seededRandom } from './scenery.pure';

export const SKY_TONES = ['sky-1', 'sky-2', 'sky-3', 'sky-4'] as const;
export type SkyTone = (typeof SKY_TONES)[number];

const SURFACE_SHARE: Readonly<Record<SkyTone, number>> = { 'sky-1': 64, 'sky-2': 71, 'sky-3': 79, 'sky-4': 87 };

// decision: FE-011 §4
export function skyColour(tone: SkyTone): string {
  return `color-mix(in oklab, var(--zone-surface) ${SURFACE_SHARE[tone]}%, var(--info))`;
}

export function skyTop(): string {
  return skyColour('sky-1');
}

export interface SkyFacet {
  readonly points: string;
  readonly tone: SkyTone;
}

export interface SkyOptions {
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly rise?: number;
  readonly seed: number;
}

const BAND_EDGES = [0.36, 0.68] as const;
const SKY_CELL = { width: 300, height: 80 } as const;
const WAVE = 0.05;

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
