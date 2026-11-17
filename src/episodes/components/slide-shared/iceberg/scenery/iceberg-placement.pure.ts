import type { Zone } from '../zones.pure';

export const KEEL_DEPTH = 200;

export const TIP_HEIGHT = 168;

export const ICEBERG_HALF_WIDTH = 190;

const KEEL_TOUCH = 0.2;

export interface IcebergFrame {
  readonly x: number;
  readonly waterline: number;
  readonly scale: number;
  readonly sunlitBottom: number;
  readonly twilightDepth: number;
}

export interface IcebergPlacement {
  readonly x: number;
  readonly waterline: number;
  readonly scale: number;
  readonly depthScale: number;
}

export function placeIceberg({ x, waterline, scale, sunlitBottom, twilightDepth }: IcebergFrame): IcebergPlacement {
  if (!(scale > 0) || !(twilightDepth > 0))
    throw new Error(`An iceberg needs a positive scale and Twilight depth, got ${scale} and ${twilightDepth}.`);
  if (sunlitBottom <= waterline)
    throw new Error(`The Sunlit zone must end below the waterline (${waterline}), got ${sunlitBottom}.`);
  const keelY = sunlitBottom + KEEL_TOUCH * twilightDepth;
  return { x, waterline, scale, depthScale: (keelY - waterline) / (scale * KEEL_DEPTH) };
}

export interface ZoneBand {
  readonly zone: Zone;
  readonly top: number;
  readonly bottom: number;
}

export function placeIcebergInBands(
  bands: readonly ZoneBand[],
  berg: Pick<IcebergFrame, 'x' | 'waterline' | 'scale'>,
): IcebergPlacement {
  const band = (zone: 'sunlit' | 'twilight') => {
    const found = bands.find((own) => own.zone === zone);
    if (found === undefined) throw new Error(`The Scene has no ${zone} band to place the iceberg in.`);
    return found;
  };
  const twilight = band('twilight');
  return placeIceberg({ ...berg, sunlitBottom: band('sunlit').bottom, twilightDepth: twilight.bottom - twilight.top });
}
