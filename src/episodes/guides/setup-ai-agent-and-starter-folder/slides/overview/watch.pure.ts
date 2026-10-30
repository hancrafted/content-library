import type { Locale } from '@/shared/lib/locale.pure';

/** An unlisted Episode offered while a viewer waits, with its words in the viewer's language. */
export interface WatchEpisode {
  readonly path: string;
  readonly title: string;
  readonly caption: string;
  /** The release day, `YYYY-MM-DD`. */
  readonly day: string;
  /** The Tag ids the Episode carries, lead first. */
  readonly tags: readonly ('context-engineering' | 'agentic-ai' | 'workflow')[];
}

const AXEL = '/episode/2026-10-23-axel-agentic-workflow__';
const AKADEMIE = '/episode/2026-10-28-cyberforum-akademie-intro-agentic-workflow__';
const FREELANCER = ['context-engineering', 'agentic-ai', 'workflow'] as const;
const ATTENTION = ['context-engineering', 'workflow'] as const;

/*
 * English readers get the AXEL copies, German readers the Akademie copies: linked, never copied, each in its own
 * language. The freelancer Episode first, then the attention span. Titles, captions and dates are the Episodes' own.
 */
const WATCH: Readonly<Record<Locale, readonly WatchEpisode[]>> = {
  en: [
    {
      path: `${AXEL}onboard-ai-every-time`,
      title: 'Treat AI like a brilliant freelancer with amnesia',
      caption: 'It knows every trade and forgets you every time, so every job starts from day one.',
      day: '2026-10-23',
      tags: FREELANCER,
    },
    {
      path: `${AXEL}ai-attention-span`,
      title: 'Why AI has a weird attention span you must learn to manage',
      caption:
        'A long chat behaves like a long call: its attention is a limited window, so you manage what goes into it.',
      day: '2026-10-23',
      tags: ATTENTION,
    },
  ],
  de: [
    {
      path: `${AKADEMIE}onboard-ai-every-time`,
      title: 'Behandle KI wie einen brillanten Freelancer mit Amnesie',
      caption: 'KI kennt jedes Fach und vergisst Dich jedes Mal, also fängt jeder Auftrag bei Tag 1 an.',
      day: '2026-10-28',
      tags: FREELANCER,
    },
    {
      path: `${AKADEMIE}ai-attention-span`,
      title: 'Warum KI eine seltsame Aufmerksamkeitsspanne hat, die Du managen lernen musst',
      caption:
        'Ein langer Chat verhält sich wie ein langes Telefonat: Seine Aufmerksamkeit ist ein begrenztes Fenster, also steuerst Du, was hineinkommt.',
      day: '2026-10-28',
      tags: ATTENTION,
    },
  ],
};

/** The Episodes to watch in the meantime, for a locale. */
export function watchFor(locale: Locale): readonly WatchEpisode[] {
  return WATCH[locale];
}
