import type { PopoverRules, PopoverSide } from '@/shared/lib/popover-placement.pure';

export const RAIL_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type RailItem = (typeof RAIL_ITEMS)[number];

export type RailSide = PopoverSide;

export const TOGGLETIP_RULES: PopoverRules = {
  maxWidth: 256,
  gap: 12,
  minRoom: 120,
};

export function railSide(index: number): RailSide {
  if (!Number.isInteger(index) || index < 0) throw new Error(`${index} is not a position on the rail.`);
  return index % 2 === 0 ? 'above' : 'below';
}
