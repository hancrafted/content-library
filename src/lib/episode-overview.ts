import type { EpisodeSlug } from './routes';

/*
 * The Episode overview's central lists: the vocabularies an Episode's metadata
 * picks from, the look each Tag gives its Episodes, and the Featured slots.
 * Everything else about an Episode lives in its own folder
 * (`episodes/<slug>/episode-metadata.ts`). Ids only; every string a visitor
 * reads is a Translation key (FE-003).
 */

/** A colour family a design can draw; the design owns the shade. */
export const ACCENTS = ['primary', 'amber', 'emerald', 'sky', 'rose', 'violet'] as const;
export type Accent = (typeof ACCENTS)[number];

/** An icon by name, so this stays data; the landing turns the name into a drawing. */
export const ICONS = ['sparkles', 'handshake', 'file-text', 'coins', 'hourglass', 'list-plus'] as const;
export type TagIcon = (typeof ICONS)[number];

export interface TagLook {
  readonly icon: TagIcon;
  readonly accent: Accent;
}

/**
 * The closed Tag vocabulary: the only Tags an Episode may carry. An Episode's
 * first Tag is its lead Tag, and that Tag's look is its card's icon and accent.
 * Each Tag's name and tooltip are Translation keys by id.
 */
export const TAGS = {
  'context-engineering': { icon: 'hourglass', accent: 'sky' },
  'agentic-ai': { icon: 'sparkles', accent: 'violet' },
  markdown: { icon: 'file-text', accent: 'rose' },
  cost: { icon: 'coins', accent: 'amber' },
  sales: { icon: 'handshake', accent: 'emerald' },
  workflow: { icon: 'list-plus', accent: 'primary' },
} as const satisfies Record<string, TagLook>;
export type TagId = keyof typeof TAGS;
export const TAG_IDS = Object.keys(TAGS) as readonly TagId[];

/** The Tags the overview offers as filter chips, in order; search still matches every Tag name. */
export const FILTER_TAGS = [
  'context-engineering',
  'agentic-ai',
  'markdown',
  'cost',
  'sales',
] as const satisfies readonly TagId[];

export const FORMATS = ['foundations', 'teardown', 'short'] as const;
export type FormatId = (typeof FORMATS)[number];

/** Registered Episodes that are layout references, not content: never in the overview. */
export const LAYOUT_REFERENCES = [
  'page-template',
  'slide-layouts',
  'slide-master',
  'slides',
] as const satisfies readonly EpisodeSlug[];

/** A registered Episode the overview lists: every one but the layout references. */
export type ListedEpisodeSlug = Exclude<EpisodeSlug, (typeof LAYOUT_REFERENCES)[number]>;

/** The Featured slots: published Episodes, lead first. Re-ranking is this one edit. */
export const FEATURED = [
  'onboard-ai-every-time',
  'ai-attention-span',
  'ai-gives-you-more-work',
] as const satisfies readonly [ListedEpisodeSlug, ListedEpisodeSlug, ListedEpisodeSlug];
