import { PRIMARY_LOOK, type AccentClasses } from '@/components/ui/card-shell';
import type { Accent, TagIcon } from '@/lib/episode-overview';
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

/** Each Tag accent drawn as the classes a card needs; whole strings, so Tailwind can see each one. */
export const TAG_ACCENTS: Record<Accent, AccentClasses> = {
  primary: PRIMARY_LOOK,
  amber: {
    ink: 'text-amber-700 dark:text-amber-400',
    wash: 'from-amber-500/15',
    edge: 'hover:border-amber-500/50 has-[a:focus-visible]:border-amber-500/50',
  },
  emerald: {
    ink: 'text-emerald-700 dark:text-emerald-400',
    wash: 'from-emerald-500/15',
    edge: 'hover:border-emerald-500/50 has-[a:focus-visible]:border-emerald-500/50',
  },
  sky: {
    ink: 'text-sky-700 dark:text-sky-400',
    wash: 'from-sky-500/15',
    edge: 'hover:border-sky-500/50 has-[a:focus-visible]:border-sky-500/50',
  },
  rose: {
    ink: 'text-rose-700 dark:text-rose-400',
    wash: 'from-rose-500/15',
    edge: 'hover:border-rose-500/50 has-[a:focus-visible]:border-rose-500/50',
  },
  violet: {
    ink: 'text-violet-700 dark:text-violet-400',
    wash: 'from-violet-500/15',
    edge: 'hover:border-violet-500/50 has-[a:focus-visible]:border-violet-500/50',
  },
};
