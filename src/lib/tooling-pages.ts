/**
 * Tooling pages: authoring benches served at `/episodes/<slug>/` beside the Episodes, but no Episode (design-ADR
 * 0016 decision 12). They have no visibility and no status, are `noindex`, self-canonical and never in the sitemap,
 * and no Episode list shows them. Their records sit in `src/components/episodes/tooling-pages.ts`, not the registry.
 */
export const TOOLING_SLUGS = [
  // The Episode template: the copy source for a new Episode, linked from the bottom of /episodes.
  'page-template',
  // The Workshop template: the copy source for the opening Episode of a new Event (title, agenda, scope, orga).
  'workshop-template',
  // The Slide library: a catalogue of reusable Slide layouts, linked from the bottom of /episodes.
  'slide-master',
  // The Explorable explanations page: the cornerstone Slides one by one, a preview bench and a link to send one Slide.
  'slides',
] as const;

export type ToolingSlug = (typeof TOOLING_SLUGS)[number];

export function isToolingSlug(slug: string): slug is ToolingSlug {
  return (TOOLING_SLUGS as readonly string[]).includes(slug);
}
