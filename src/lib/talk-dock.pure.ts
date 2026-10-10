/*
 * Where the talk player sits (FE-009 §8: chrome, z-40). One iframe host that is never
 * re-parented tracks the Title slide's talk slot, or docks bottom-left under the table of
 * contents. These are the pure decisions; the client leaf applies them.
 */

export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** The docked card's width: the table of contents' width, so the two stack in one column. */
export const DOCK_WIDTH_REM = 17;
/** The opaque header above the 16:9 frame. */
export const HEADER_REM = 2;
/** Room the card keeps from the viewport's left and bottom edges. */
export const DOCK_GAP_REM = 1;

/** Set on the Episode page while the card is docked, so the table of contents can leave it room. */
export const TALK_DOCKED_ATTR = 'data-talk-docked';

/** What the table of contents gives up while the card is docked: its height plus the gap above it. */
export function tocReserveRem(): number {
  return dockedHeightRem() + DOCK_GAP_REM;
}

/** The glide matches the Context drawer card's motion (FE-010 §7). */
export const GLIDE_MS = 250;
export const GLIDE_EASING = 'ease-out';

const PX_PER_REM = 16;
const FRAME_RATIO = 9 / 16;

/** The docked card's height: its header plus the 16:9 frame. */
export function dockedHeightRem(): number {
  return HEADER_REM + DOCK_WIDTH_REM * FRAME_RATIO;
}

/** Docks when the reader leaves the Title slide, and only from `lg`; the active Slide is `null` until known. */
export function shouldDock({ active, wide }: { active: string | null; wide: boolean }): boolean {
  return wide && active !== null && active !== 'top';
}

export interface Placement {
  /** `absolute` against the page while undocked, so it scrolls with the content; `fixed` only when docked. */
  readonly position: 'absolute' | 'fixed';
  readonly left: string;
  readonly top: string;
  readonly bottom: string;
  readonly width: string;
  /** The individual `translate` property, so the glide's `transform` keyframes compose with it. */
  readonly translate: string;
}

/**
 * The host's position. Undocked it is `absolute` against the page at the origin and a translate carries it to the
 * slot's page coordinates (viewport rect plus scroll), header in the strip above, so it scrolls natively and never
 * lags. Docked it is `fixed` in the corner.
 */
export function placementOf(input: {
  docked: boolean;
  slot: Rect | null;
  scroll?: { x: number; y: number };
}): Placement {
  const { docked, slot, scroll = { x: 0, y: 0 } } = input;
  if (docked) {
    return {
      position: 'fixed',
      left: `${DOCK_GAP_REM}rem`,
      top: 'auto',
      bottom: `${DOCK_GAP_REM}rem`,
      width: `${DOCK_WIDTH_REM}rem`,
      translate: 'none',
    };
  }
  const headerPx = HEADER_REM * PX_PER_REM;
  const translate = slot ? `${slot.left + scroll.x}px ${slot.top + scroll.y - headerPx}px` : '0px -100vh';
  return { position: 'absolute', left: '0px', top: '0px', bottom: 'auto', width: `${slot?.width ?? 0}px`, translate };
}

/**
 * The inverse transform of a move (FLIP): applied to the box at its new place it makes it
 * look as it did at the old one, so animating it to `none` glides with `transform` alone.
 * `null` when either box is empty.
 */
export function flipTransform(first: Rect, last: Rect): string | null {
  if (first.width === 0 || last.width === 0) return null;
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const scale = first.width / last.width;
  return `translate(${dx}px, ${dy}px) scale(${scale})`;
}
