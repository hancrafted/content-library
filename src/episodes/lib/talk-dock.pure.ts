// decision: FE-009 §8
export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export const DOCK_WIDTH_REM = 17;
export const HEADER_REM = 2;
export const DOCK_GAP_REM = 1;

export const TALK_DOCKED_ATTR = 'data-talk-docked';

export function tocReserveRem(): number {
  return dockedHeightRem() + DOCK_GAP_REM;
}

// decision: FE-010 §7
export const GLIDE_MILLISECONDS = 250;
export const GLIDE_EASING = 'ease-out';

const PX_PER_REM = 16;
const FRAME_RATIO = 9 / 16;

export function dockedHeightRem(): number {
  return HEADER_REM + DOCK_WIDTH_REM * FRAME_RATIO;
}

export function shouldDock({ active, wide }: { active: string | null; wide: boolean }): boolean {
  return wide && active !== null && active !== 'top';
}

export interface Placement {
  readonly position: 'absolute' | 'fixed';
  readonly left: string;
  readonly top: string;
  readonly bottom: string;
  readonly width: string;
  readonly translate: string;
}

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
  const headerPixels = HEADER_REM * PX_PER_REM;
  const translate = slot ? `${slot.left + scroll.x}px ${slot.top + scroll.y - headerPixels}px` : '0px -100vh';
  return { position: 'absolute', left: '0px', top: '0px', bottom: 'auto', width: `${slot?.width ?? 0}px`, translate };
}

export function flipTransform(first: Rect, last: Rect): string | null {
  if (first.width === 0 || last.width === 0) return null;
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const scale = first.width / last.width;
  return `translate(${dx}px, ${dy}px) scale(${scale})`;
}
