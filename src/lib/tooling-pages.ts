/**
 * Tooling pages: catalogues of Slides served at `/episodes/<slug>/` beside the Episodes, but no Episode (design-ADR
 * 0016). They carry no visibility, are `noindex`, self-canonical and never in the sitemap.
 */
export const TOOLING_SLUGS = [
  // Built and exported, linked from neither the landing page nor the header.
  'slide-layouts',
  // A catalog of reusable Slide layouts, linked from the bottom of /episodes beside the page template.
  'slide-master',
  // The cornerstone Slides one by one, outside their Episodes: a preview bench and a link to send one Slide.
  'slides',
] as const;

export type ToolingSlug = (typeof TOOLING_SLUGS)[number];

export function isToolingSlug(slug: string): slug is ToolingSlug {
  return (TOOLING_SLUGS as readonly string[]).includes(slug);
}
