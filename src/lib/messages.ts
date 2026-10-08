import type { Locale } from './locale.pure';

const en = {
  brand: { name: 'hancrafted', home: 'hancrafted, go to the landing page' },
  nav: { label: 'Main', episodes: 'Episodes' },
  theme: { label: 'Theme', light: 'Light', dark: 'Dark', system: 'System' },
  locale: { label: 'Language' },
  landing: { title: 'Home', link: 'Page template' },
  episodeTemplate: { title: 'Page template' },
};

export type Messages = typeof en;

const de: Messages = {
  brand: { name: 'hancrafted', home: 'hancrafted, zur Startseite' },
  nav: { label: 'Hauptnavigation', episodes: 'Episoden' },
  theme: { label: 'Farbschema', light: 'Hell', dark: 'Dunkel', system: 'System' },
  locale: { label: 'Sprache' },
  landing: { title: 'Start', link: 'Seitenvorlage' },
  episodeTemplate: { title: 'Seitenvorlage' },
};

export const MESSAGES: Record<Locale, Messages> = { en, de };
