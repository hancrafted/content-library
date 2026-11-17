export function explorableHomeSlugs(pageSlugs: readonly string[], own?: string): readonly string[] {
  return pageSlugs.filter((slug) => slug !== own);
}
