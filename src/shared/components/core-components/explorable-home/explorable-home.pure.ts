/*
 * An Explorable's home: the Explorable page whose slug is the Explorable's own (spec #404). Derived from the slug
 * join, nothing stored: an Explorable with no page has no home, and the page whose primary it is does not link to
 * itself.
 */

/** The slugs of the Explorable pages an Explorable's link may reach: every built page except `own`, the one rendering. */
export function explorableHomeSlugs(pageSlugs: readonly string[], own?: string): readonly string[] {
  return pageSlugs.filter((slug) => slug !== own);
}
