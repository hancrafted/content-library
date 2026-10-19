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
export const ICONS = ['sparkles', 'handshake', 'file-text', 'coins'] as const;
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
  'ai-enablement': { icon: 'sparkles', accent: 'violet' },
  sales: { icon: 'handshake', accent: 'emerald' },
  'knowledge-base': { icon: 'file-text', accent: 'sky' },
  cost: { icon: 'coins', accent: 'amber' },
} as const satisfies Record<string, TopicLook>;
export type TopicId = keyof typeof TOPICS;
export const TOPIC_IDS = Object.keys(TOPICS) as readonly TopicId[];

/** The Topic the overview leads with and marks on every card it holds: the channel's main subject. */
export const HIGHLIGHTED_TOPIC = 'ai-enablement' as const satisfies TopicId;

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

/** The Featured slots: published Episodes, lead first. Re-ranking is this one edit. */
export const FEATURED = [
  'never-too-early-sales',
  'maintaining-markdown-for-ai',
  'ai-token-economy',
] as const satisfies readonly [ListedEpisodeSlug, ListedEpisodeSlug, ListedEpisodeSlug];
