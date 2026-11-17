import {
  Coins,
  FileText,
  Handshake,
  Hourglass,
  LayoutDashboard,
  ListPlus,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export const NAMED_ICONS = {
  sparkles: Sparkles,
  hourglass: Hourglass,
  'list-plus': ListPlus,
  'layout-dashboard': LayoutDashboard,
  handshake: Handshake,
  'file-text': FileText,
  coins: Coins,
} as const satisfies Record<string, LucideIcon>;
