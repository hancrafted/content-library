/*
 * Where a Slide's popover lands in the viewport, beside the element that
 * opened it. One rule for every popover Slide; each Slide passes its own
 * widths and gaps. No DOM, no React.
 */

export type PopoverSide = 'above' | 'below';

export interface Box {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export interface Viewport {
  readonly width: number;
  readonly height: number;
}

/** The Slide's own numbers: how wide the popover grows, how far it keeps from its anchor, and the least room a side needs. */
export interface PopoverRules {
  readonly maxWidth: number;
  readonly gap: number;
  /** The least room the preferred side needs before the popover flips to the other side. */
  readonly minRoom: number;
}

export interface PopoverRequest extends PopoverRules {
  readonly anchor: Box;
  readonly viewport: Viewport;
  /** The side the popover opens on when it has room there. */
  readonly side: PopoverSide;
}

export type PopoverPlacement =
  PlacementOn<'above', { readonly bottom: number }> | PlacementOn<'below', { readonly top: number }>;

type PlacementOn<S extends PopoverSide, Edge> = Edge & {
  readonly side: S;
  readonly left: number;
  readonly width: number;
  /** The arrow's x inside the popover, pointing at the anchor's centre. */
  readonly arrowX: number;
};

/** Space kept between a popover and the viewport edge, the same for every Slide. */
const MARGIN = 16;

function assertRules({ maxWidth, gap, minRoom }: PopoverRules): void {
  for (const [name, value] of Object.entries({ maxWidth, gap, minRoom })) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`Popover ${name} ${value} is not a length.`);
  }
}

/**
 * Where a popover opens for an anchor (viewport coordinates): on the
 * preferred side, flipped when that side has less than `minRoom`, centred
 * on the anchor and clamped inside the viewport. `above` sets `bottom`, so
 * the popover grows upward whatever its height.
 */
export function placePopover(request: PopoverRequest): PopoverPlacement {
  const { anchor, viewport, side, maxWidth, gap, minRoom } = request;
  assertRules({ maxWidth, gap, minRoom });
  const roomAbove = anchor.top - gap;
  const roomBelow = viewport.height - (anchor.top + anchor.height) - gap;
  const preferredRoom = side === 'above' ? roomAbove : roomBelow;
  const placed: PopoverSide = preferredRoom >= minRoom ? side : side === 'above' ? 'below' : 'above';
  const width = Math.max(0, Math.min(maxWidth, viewport.width - 2 * MARGIN));
  const centre = anchor.left + anchor.width / 2;
  const left = Math.min(Math.max(centre - width / 2, MARGIN), viewport.width - MARGIN - width);
  const arrowX = centre - left;
  return placed === 'above'
    ? { side: placed, bottom: viewport.height - anchor.top + gap, left, width, arrowX }
    : { side: placed, top: anchor.top + anchor.height + gap, left, width, arrowX };
}

/** The fixed CSS box for a placement: `bottom` above the anchor so it grows upward, `top` below it. */
export type PopoverBox =
  | { readonly bottom: number; readonly left: number; readonly width: number }
  | { readonly top: number; readonly left: number; readonly width: number };

export function popoverBox(placement: PopoverPlacement): PopoverBox {
  const { left, width } = placement;
  return placement.side === 'above' ? { bottom: placement.bottom, left, width } : { top: placement.top, left, width };
}
