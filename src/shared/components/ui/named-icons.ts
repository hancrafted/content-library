import { Coins, FileText, Handshake, Hourglass, ListPlus, Sparkles, type LucideIcon } from 'lucide-react';

/*
 * Icons by name, so a record can name one as data and stay free of React. Domain-free: whoever names an icon (a Tag's
 * look beside its vocabulary in the content store) picks from these names, and `tsc` refuses one this map lacks.
 */
export const NAMED_ICONS = {
  sparkles: Sparkles,
  hourglass: Hourglass,
  'list-plus': ListPlus,
  handshake: Handshake,
  'file-text': FileText,
  coins: Coins,
} as const satisfies Record<string, LucideIcon>;

/** A name the map holds. */
export type NamedIcon = keyof typeof NAMED_ICONS;

/** Every name the map holds, for a loader that checks a name given as data. */
export const NAMED_ICON_NAMES = Object.keys(NAMED_ICONS) as readonly NamedIcon[];
