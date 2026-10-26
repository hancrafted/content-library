/*
 * The horizontal rail's geometry: which side of the line a label sits on and
 * how wide a dot's toggletip grows. No DOM, no React.
 */

import type { PopoverRules, PopoverSide } from '@/lib/popover-placement.pure';

/** The milestones on the rail, in order; each names its Translation keys under `items.<key>`. */
export const RAIL_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type RailItem = (typeof RAIL_ITEMS)[number];

export type RailSide = PopoverSide;

/** The toggletip's widths and gaps for the shared popover placement (`@/lib/popover-placement.pure`). */
export const TOGGLETIP_RULES: PopoverRules = {
  /** The widest a toggletip grows; a phone narrows it to the viewport minus its margins. */
  maxWidth: 256,
  /** Space kept between a toggletip and its label. */
  gap: 12,
  /** The least room a side needs before a toggletip opens there instead of flipping. */
  minRoom: 120,
};

/** Labels alternate, the first above the line. */
export function railSide(index: number): RailSide {
  if (!Number.isInteger(index) || index < 0) throw new Error(`${index} is not a position on the rail.`);
  return index % 2 === 0 ? 'above' : 'below';
}
