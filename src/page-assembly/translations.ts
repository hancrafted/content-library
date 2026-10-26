import episodeBrowserDe from '@/episodes/components/episode-browser/i18n/de.json';
import episodeBrowserEn from '@/episodes/components/episode-browser/i18n/en.json';
import episodePageDe from '@/episodes/components/episode-page/i18n/de.json';
import episodePageEn from '@/episodes/components/episode-page/i18n/en.json';
import eventsDe from '@/events/lib/i18n/de.json';
import eventsEn from '@/events/lib/i18n/en.json';
import { mergeTranslationFiles, translationOwner, type MergedMessages } from '@/shared/i18n/merge-translations.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import chromeDe from '@/shared/page-chrome/i18n/de.json';
import chromeEn from '@/shared/page-chrome/i18n/en.json';
import type {} from 'next-intl';
import dashboardDe from './dashboard/i18n/de.json';
import dashboardEn from './dashboard/i18n/en.json';
import episodeOverviewDe from './episode-overview/i18n/de.json';
import episodeOverviewEn from './episode-overview/i18n/en.json';
import eventDe from './event/i18n/de.json';
import eventEn from './event/i18n/en.json';
import eventsOverviewDe from './events-overview/i18n/de.json';
import eventsOverviewEn from './events-overview/i18n/en.json';
import landingDe from './landing/i18n/de.json';
import landingEn from './landing/i18n/en.json';
import pageCopyDe from './lib/i18n/de.json';
import pageCopyEn from './lib/i18n/en.json';

/*
 * The site's message set, merged from every owner's Translation files (FE-003 §4). Page assembly sits above every
 * owner (templates, product areas, page chrome), so this root file is the one place that may import them all; only
 * the next-intl request config and tests import it. Code reads the merged set through next-intl, and its own words
 * from its own folder.
 */

/** Every owner's `i18n/` pair. A namespace two of them define fails this module's load: the fast suite and the build. */
export const TRANSLATION_OWNERS = [
  translationOwner('src/shared/page-chrome/i18n', chromeEn, chromeDe),
  translationOwner('src/page-assembly/lib/i18n', pageCopyEn, pageCopyDe),
  translationOwner('src/page-assembly/landing/i18n', landingEn, landingDe),
  translationOwner('src/page-assembly/episode-overview/i18n', episodeOverviewEn, episodeOverviewDe),
  translationOwner('src/page-assembly/events-overview/i18n', eventsOverviewEn, eventsOverviewDe),
  translationOwner('src/page-assembly/event/i18n', eventEn, eventDe),
  translationOwner('src/page-assembly/dashboard/i18n', dashboardEn, dashboardDe),
  translationOwner('src/events/lib/i18n', eventsEn, eventsDe),
  translationOwner('src/episodes/components/episode-browser/i18n', episodeBrowserEn, episodeBrowserDe),
  translationOwner('src/episodes/components/episode-page/i18n', episodePageEn, episodePageDe),
] as const;

/** The merged English files: the type every `t('…')` key is checked against. */
export type Messages = MergedMessages<typeof TRANSLATION_OWNERS>;

export const TRANSLATIONS: Record<Locale, Messages> = mergeTranslationFiles(TRANSLATION_OWNERS);

/**
 * Types every `t('…')` key and `locale` argument against the merged set; elsewhere, `Messages` from `next-intl` is
 * this type. The empty import loads `next-intl` into every program, so the augmentation applies even where no other
 * file imports its main entry; without it `next-intl/server` translators silently accept any key.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
