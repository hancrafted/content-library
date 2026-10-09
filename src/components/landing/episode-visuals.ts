import type { Accent, EpisodeIcon } from '@/lib/episode-index.pure';
import {
  BookOpen,
  Brain,
  Coins,
  Compass,
  FileText,
  GitBranch,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

/** The index names an icon as data; this is the one place the landing turns the name into a drawing. */
export const EPISODE_ICONS: Record<EpisodeIcon, LucideIcon> = {
  'book-open': BookOpen,
  'file-text': FileText,
  coins: Coins,
  brain: Brain,
  users: Users,
  compass: Compass,
  'shield-check': ShieldCheck,
  'git-branch': GitBranch,
};

/** One colour family drawn as the classes a card needs; whole strings, so Tailwind can see each one. */
export interface AccentClasses {
  /** The icon tile: a faint wash with the accent as the glyph. */
  readonly tile: string;
  /** The accent as plain text or an icon, 4.5:1 on the page in both themes. */
  readonly ink: string;
  /** The corner wash that tints a large card. */
  readonly wash: string;
  /** The card's border once hovered or focused. */
  readonly edge: string;
}

export const EPISODE_ACCENTS: Record<Accent, AccentClasses> = {
  primary: {
    tile: 'bg-primary/10 text-primary',
    ink: 'text-primary',
    wash: 'from-primary/10',
    edge: 'hover:border-primary/40 has-[a:focus-visible]:border-primary/40',
  },
  amber: {
    tile: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    ink: 'text-amber-700 dark:text-amber-400',
    wash: 'from-amber-500/15',
    edge: 'hover:border-amber-500/50 has-[a:focus-visible]:border-amber-500/50',
  },
  emerald: {
    tile: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    ink: 'text-emerald-700 dark:text-emerald-400',
    wash: 'from-emerald-500/15',
    edge: 'hover:border-emerald-500/50 has-[a:focus-visible]:border-emerald-500/50',
  },
  sky: {
    tile: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    ink: 'text-sky-700 dark:text-sky-400',
    wash: 'from-sky-500/15',
    edge: 'hover:border-sky-500/50 has-[a:focus-visible]:border-sky-500/50',
  },
  rose: {
    tile: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    ink: 'text-rose-700 dark:text-rose-400',
    wash: 'from-rose-500/15',
    edge: 'hover:border-rose-500/50 has-[a:focus-visible]:border-rose-500/50',
  },
  violet: {
    tile: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
    ink: 'text-violet-700 dark:text-violet-400',
    wash: 'from-violet-500/15',
    edge: 'hover:border-violet-500/50 has-[a:focus-visible]:border-violet-500/50',
  },
};
