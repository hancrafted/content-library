import type { Locale } from './locale.pure';
import type { PageKey } from './routes';

/** A page's `<title>` and meta description (FE-008). The layout's title template appends the brand below the root only, so a root page names it itself. */
interface PageMeta {
  title: string;
  description: string;
}

const en = {
  brand: { name: 'hancrafted', home: 'hancrafted, go to the landing page' },
  nav: { label: 'Main', episodes: 'Episodes' },
  theme: { label: 'Theme', light: 'Light', dark: 'Dark', system: 'System' },
  locale: { label: 'Language' },
  landing: { title: 'Home', link: 'Page template' },
  episodeTemplate: { title: 'Page template' },
  meta: {
    home: {
      title: 'Visualised theory · hancrafted',
      description: 'Theory from the hancrafted training videos, visualised page by page.',
    },
    episodeTemplate: {
      title: 'Page template',
      description: 'The layout every episode follows: sections of slides stacked down one page.',
    },
  } satisfies Record<PageKey, PageMeta>,
};

export type Messages = typeof en;

const de: Messages = {
  brand: { name: 'hancrafted', home: 'hancrafted, zur Startseite' },
  nav: { label: 'Hauptnavigation', episodes: 'Episoden' },
  theme: { label: 'Farbschema', light: 'Hell', dark: 'Dunkel', system: 'System' },
  locale: { label: 'Sprache' },
  landing: { title: 'Start', link: 'Seitenvorlage' },
  episodeTemplate: { title: 'Seitenvorlage' },
  meta: {
    home: {
      title: 'Visualisierte Theorie · hancrafted',
      description: 'Theorie aus den hancrafted-Schulungsvideos, Seite für Seite visualisiert.',
    },
    episodeTemplate: {
      title: 'Seitenvorlage',
      description: 'Das Layout jeder Episode: Abschnitte aus Folien, untereinander auf einer Seite.',
    },
  },
};

export const MESSAGES: Record<Locale, Messages> = { en, de };
