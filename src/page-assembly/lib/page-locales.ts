import { pageLocales, routeOf, TEMPLATE_TYPE_PATHS } from '@/content-store/catalogue/record-routes';
import { PAGES } from '@/content-store/store';
import { LOCALES, type LocalesByRoute } from '@/shared/lib/locale.pure';

/**
 * Each exported page not in every site locale, by logical path, with the locales it is exported in: read from the page
 * catalogue, for page chrome's locale toggle, which reads no record itself. The root layouts hand it to `SiteShell`.
 */
export function localesByRoute(): LocalesByRoute {
  return Object.fromEntries(
    PAGES.filter(({ page, treatment }) => treatment.exported && pageLocales(page).length < LOCALES.length).map(
      ({ page }) => [routeOf(page), pageLocales(page)],
    ),
  );
}

/**
 * The logical path each Template type's pages sit under (`/episode-templates`, `/master-slides`), so the header's Resources
 * link stays lit on a Template page: page chrome reads no record, and the root layouts hand these in.
 */
export function templateSections(): readonly string[] {
  return Object.values(TEMPLATE_TYPE_PATHS).map((path) => `/${path}`);
}
