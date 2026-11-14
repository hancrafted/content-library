/*
 * The one iceberg placement (decision 10 of feedback 2): the title hero, `ZoneScene` and `WholeDepthScene` all place
 * the berg through `placeIceberg`, so its body floats in the Sunlit zone and its keel only touches the Twilight zone
 * in every Scene; a Scene that draws its zone bands hands them to `placeIcebergInBands`, which reads the frame from
 * them. The drawing's own measures sit here too: they are the frozen box `Iceberg` draws in.
 */
import type { Zone } from '../zones.pure';

/** The keel's depth below the waterline at depth scale 1, in scene units: the drawing's frozen box, downward. */
export const KEEL_DEPTH = 200;

/** The tip's height above the waterline, in scene units: the drawing's frozen box, upward. */
export const TIP_HEIGHT = 168;

/** The iceberg's half width at its widest, in scene units: the drawing's frozen box, across. */
export const ICEBERG_HALF_WIDTH = 190;

/** How far into the Twilight zone the keel's point reaches, as a share of that zone's depth. */
const KEEL_TOUCH = 0.2;

export interface IcebergFrame {
  /** The berg's centre, across. */
  readonly x: number;
  readonly waterline: number;
  /** The berg's size; its keel stretches to the same depth at any scale. */
  readonly scale: number;
  /** Where the Sunlit zone ends and the Twilight zone starts, in the Scene's units. */
  readonly sunlitBottom: number;
  /** The Twilight zone's depth in the Scene; a Scene that does not draw it passes the depth it would have. */
  readonly twilightDepth: number;
}

/** What `Iceberg` takes to stand where `placeIceberg` puts it. */
export interface IcebergPlacement {
  readonly x: number;
  readonly waterline: number;
  readonly scale: number;
  readonly depthScale: number;
}

/** Places the berg on the waterline with its keel's point a fifth of the way into the Twilight zone. */
export function placeIceberg({ x, waterline, scale, sunlitBottom, twilightDepth }: IcebergFrame): IcebergPlacement {
  if (!(scale > 0) || !(twilightDepth > 0))
    throw new Error(`An iceberg needs a positive scale and Twilight depth, got ${scale} and ${twilightDepth}.`);
  if (sunlitBottom <= waterline)
    throw new Error(`The Sunlit zone must end below the waterline (${waterline}), got ${sunlitBottom}.`);
  const keelY = sunlitBottom + KEEL_TOUCH * twilightDepth;
  return { x, waterline, scale, depthScale: (keelY - waterline) / (scale * KEEL_DEPTH) };
}

/** One zone's band in a Scene, its top and bottom in the Scene's units; the shape every Scene's band list shares. */
export interface ZoneBand {
  readonly zone: Zone;
  readonly top: number;
  readonly bottom: number;
}

/** Places the berg in a Scene's own bands: the Sunlit band's bottom and the Twilight band's depth frame the keel. */
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
