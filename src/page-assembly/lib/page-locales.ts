import { pageLocales, routeOf } from '@/content-store/catalogue/record-routes';
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
