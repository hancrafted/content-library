import type { EpisodeSlug } from './routes';

/*
 * The Episode overview's central lists: the vocabularies an Episode's metadata
 * picks from, the look each Topic gives its Episodes, and the Featured slots.
 * Everything else about an Episode lives in its own folder
 * (`episodes/<slug>/episode-metadata.ts`). Ids only; every string a visitor
 * reads is a Translation key (FE-003).
 */

/** A colour family a design can draw; the design owns the shade. */
export const ACCENTS = ['primary', 'amber', 'emerald', 'sky', 'rose', 'violet'] as const;
export type Accent = (typeof ACCENTS)[number];

/** An icon by name, so this stays data; the landing turns the name into a drawing. */
export const ICONS = ['book-open', 'file-text', 'coins', 'users'] as const;
export type TopicIcon = (typeof ICONS)[number];

export interface TopicLook {
  readonly icon: TopicIcon;
  readonly accent: Accent;
}

/**
 * The curated Topics, each a YouTube playlist, in the order the overview lists
 * them. A Topic's look is every Episode's look whose primary Topic it is.
 */
export const TOPICS = {
  'ai-collaboration': { icon: 'book-open', accent: 'violet' },
  documentation: { icon: 'file-text', accent: 'sky' },
  economics: { icon: 'coins', accent: 'amber' },
  adoption: { icon: 'users', accent: 'rose' },
} as const satisfies Record<string, TopicLook>;
export type TopicId = keyof typeof TOPICS;
export const TOPIC_IDS = Object.keys(TOPICS) as readonly TopicId[];

export const FORMATS = ['foundations', 'teardown', 'short'] as const;
export type FormatId = (typeof FORMATS)[number];

/** Registered Episodes that are layout references, not content: never in the overview. */
export const LAYOUT_REFERENCES = [
  'page-template',
  'slide-layouts',
  'slide-master',
] as const satisfies readonly EpisodeSlug[];

/** A registered Episode the overview lists: every one but the layout references. */
export type ListedEpisodeSlug = Exclude<EpisodeSlug, (typeof LAYOUT_REFERENCES)[number]>;

/**
 * The Featured slots: exactly three published Episodes, lead first. Re-ranking is this one edit. Kept as literals, so
 * `featuredSlugs()` can refuse a slug whose metadata is upcoming once an upcoming Episode has a page.
 */
export const FEATURED = [
  'amnesiac-freelancer',
  'maintaining-markdown-for-ai',
  'ai-token-economy',
] as const satisfies readonly [ListedEpisodeSlug, ListedEpisodeSlug, ListedEpisodeSlug];
