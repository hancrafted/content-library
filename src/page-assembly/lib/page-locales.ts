import { pageLocales, routeOf, TEMPLATE_TYPE_PATHS } from '@/content-store/catalogue/record-routes';
import { PAGES } from '@/content-store/store';
import { LOCALES, type LocalesByRoute } from '@/shared/lib/locale.pure';

export function localesByRoute(): LocalesByRoute {
  return Object.fromEntries(
    PAGES.filter(({ page, treatment }) => treatment.exported && pageLocales(page).length < LOCALES.length).map(
      ({ page }) => [routeOf(page), pageLocales(page)],
    ),
  );
}

export function templateSections(): readonly string[] {
  return Object.values(TEMPLATE_TYPE_PATHS).map((path) => `/${path}`);
}
