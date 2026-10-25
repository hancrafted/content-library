import type { EpisodeSlug } from './routes';

/*
 * The Episode overview's central lists: the vocabularies an Episode's metadata
 * picks from, the look each top Concept gives the cards it themes, and the
 * Featured slots. Everything else about an Episode lives in its own folder
 * (`episodes/<slug>/episode-metadata.ts`); every Concept in its own file
 * (`docs/llm-wiki/concepts/<id>/concept.md`). Ids only; every string a visitor
 * reads is a Translation key (FE-003).
 */

/** A colour family a design can draw; the design owns the shade. */
export const ACCENTS = ['primary', 'amber', 'emerald', 'sky', 'rose', 'violet', 'teal'] as const;
export type Accent = (typeof ACCENTS)[number];

/** An icon by name, so this stays data; the landing turns the name into a drawing. */
export const ICONS = ['sparkles', 'handshake', 'file-text', 'coins', 'hourglass', 'list-plus', 'brain'] as const;
export type ThemeIcon = (typeof ICONS)[number];

/** The icon and accent a top Concept gives every Episode card that names it in `applyThemeFromConcept`. */
export interface ThemeLook {
  readonly icon: ThemeIcon;
  readonly accent: Accent;
}

/**
 * The theme record: one look per top Concept (`broader: []`), the closed set
 * `applyThemeFromConcept` may name. Its keys and the top Concept files are the
 * same set, which the content store checks both ways: a new top Concept is a new
 * theme, a design decision rather than a content edit. The order is the order
 * of the overview's filter chips. Each top Concept's card name and tooltip are
 * Translation keys by id (`landing.episodeOverview.concepts.<id>`).
 */
export const CONCEPT_THEMES = {
  'context-engineering': { icon: 'hourglass', accent: 'sky' },
  'agentic-ai': { icon: 'sparkles', accent: 'violet' },
  'llm-behaviour': { icon: 'brain', accent: 'teal' },
  'ai-adoption': { icon: 'list-plus', accent: 'primary' },
  'markdown-documentation': { icon: 'file-text', accent: 'rose' },
  'ai-cost': { icon: 'coins', accent: 'amber' },
  sales: { icon: 'handshake', accent: 'emerald' },
} as const satisfies Record<string, ThemeLook>;
export type TopConceptId = keyof typeof CONCEPT_THEMES;
/** The top Concepts in theme order: the overview's filter chips, one per top Concept any card names. */
export const TOP_CONCEPT_IDS = Object.keys(CONCEPT_THEMES) as readonly TopConceptId[];

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
