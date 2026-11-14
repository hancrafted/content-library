/*
 * The one iceberg placement (decision 10 of feedback 2): the title hero, `ZoneScene` and `WholeDepthScene` all place
 * the berg through `placeIceberg`, so its body floats in the Sunlit zone and its keel only touches the Twilight zone
 * in every Scene. The drawing's own measures sit here too: they are the frozen box `Iceberg` draws in.
 */

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
