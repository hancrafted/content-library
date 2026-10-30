import type { Locale } from '@/shared/lib/locale.pure';

/** An unlisted Episode offered while a viewer waits: its logical path and its title in the viewer's language. */
export interface WatchEpisode {
  readonly path: string;
  readonly title: string;
}

const AXEL = '/episode/2026-10-23-axel-agentic-workflow__';
const AKADEMIE = '/episode/2026-10-28-cyberforum-akademie-intro-agentic-workflow__';

/*
 * English readers get the AXEL copies, German readers the Akademie copies: linked, never copied, each in its own
 * language. The freelancer Episode first, then the attention span.
 */
const WATCH: Readonly<Record<Locale, readonly WatchEpisode[]>> = {
  en: [
    { path: `${AXEL}onboard-ai-every-time`, title: 'Treat AI like a brilliant freelancer with amnesia' },
    { path: `${AXEL}ai-attention-span`, title: 'Why AI has a weird attention span you must learn to manage' },
  ],
  de: [
    { path: `${AKADEMIE}onboard-ai-every-time`, title: 'Behandle KI wie einen brillanten Freelancer mit Amnesie' },
    {
      path: `${AKADEMIE}ai-attention-span`,
      title: 'Warum KI eine seltsame Aufmerksamkeitsspanne hat, die Du managen lernen musst',
    },
  ],
};

/** The Episodes to watch in the meantime, for a locale. */
export function watchFor(locale: Locale): readonly WatchEpisode[] {
  return WATCH[locale];
}
