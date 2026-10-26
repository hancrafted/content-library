import type { TagIcon } from '@/lib/episode-overview';
import { Coins, FileText, Handshake, Hourglass, ListPlus, Sparkles, type LucideIcon } from 'lucide-react';

/** A Tag names its icon as data; this is the one place the landing turns the name into a drawing. */
export const TAG_ICONS: Record<TagIcon, LucideIcon> = {
  sparkles: Sparkles,
  hourglass: Hourglass,
  'list-plus': ListPlus,
  handshake: Handshake,
  'file-text': FileText,
  coins: Coins,
};
