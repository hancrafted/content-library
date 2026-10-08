import type { Locale } from './locale.pure';

const en = {
  nav: { label: 'Main', home: 'Home', page: 'Page' },
  theme: { label: 'Theme', light: 'Light', dark: 'Dark', system: 'System' },
  locale: { label: 'Language' },
  landing: { title: 'Home', link: 'Page template' },
  episodeTemplate: { title: 'Page template' },
};

export type Messages = typeof en;

const de: Messages = {
  nav: { label: 'Hauptnavigation', home: 'Start', page: 'Seite' },
  theme: { label: 'Farbschema', light: 'Hell', dark: 'Dunkel', system: 'System' },
  locale: { label: 'Sprache' },
  landing: { title: 'Start', link: 'Seitenvorlage' },
  episodeTemplate: { title: 'Seitenvorlage' },
};

export const MESSAGES: Record<Locale, Messages> = { en, de };
