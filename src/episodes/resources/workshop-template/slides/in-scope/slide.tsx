import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

type Tone = 'ai' | 'info' | 'brand-accent';

/** The three announced terms, as keys of `pairs`: each tone tints its arrow, its landing card and its icon. Add or drop a pair in both Translation files. */
const PAIRS = [
  { key: 'first', tone: 'ai' },
  { key: 'second', tone: 'info' },
  { key: 'third', tone: 'brand-accent' },
] as const satisfies readonly { key: string; tone: Tone }[];

/** What a tone looks like, spelled out so Tailwind finds each class: the arrow, the landing card. */
const LOOK: Record<Tone, { arrow: string; card: string }> = {
  ai: { arrow: 'stroke-ai', card: 'border-ai/60 border-l-ai bg-ai/20' },
  info: { arrow: 'stroke-(--info)', card: 'border-(--info)/50 border-l-(--info) bg-(--info)/15' },
  'brand-accent': {
    arrow: 'stroke-brand-accent',
    card: 'border-brand-accent/60 border-l-brand-accent bg-brand-accent/15',
  },
};

/** One small drawing per pair, in its tone: a network, a stack of pages, a play button. */
const ICONS: Record<(typeof PAIRS)[number]['key'], ReactNode> = {
  first: (
    <svg viewBox="0 0 32 32" className="size-10 flex-none" aria-hidden="true">
      <circle cx="16" cy="16" r="4" className="fill-ai" />
      <circle cx="6" cy="8" r="3" className="fill-ai/50" />
      <circle cx="26" cy="8" r="3" className="fill-ai/50" />
      <circle cx="6" cy="25" r="3" className="fill-ai/50" />
      <circle cx="26" cy="25" r="3" className="fill-ai/50" />
      <path d="M8 10l5 4M24 10l-5 4M8 23l5-4M24 23l-5-4" className="fill-none stroke-ai" strokeWidth="1.5" />
    </svg>
  ),
  second: (
    <svg viewBox="0 0 32 32" className="size-10 flex-none" aria-hidden="true">
      <rect x="9" y="3" width="18" height="22" rx="3" className="fill-(--info)/30 stroke-(--info)" strokeWidth="1.5" />
      <rect x="5" y="7" width="18" height="22" rx="3" className="fill-background stroke-(--info)" strokeWidth="1.5" />
      <path d="M9 14h10M9 19h10M9 24h6" className="fill-none stroke-(--info)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  third: (
    <svg viewBox="0 0 32 32" className="size-10 flex-none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" className="fill-brand-accent/30 stroke-brand-accent" strokeWidth="1.5" />
      <path d="M13 10l9 6-9 6z" className="fill-brand-accent" />
    </svg>
  ),
};

// What the session covers, as a mapping read left to right: each announced term against where it lands. The Slide header shows the title and caption; the Scene holds the mapping.
export const inScope = slide({
  slug: 'in-scope',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'items' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center gap-6">
      <div
        aria-hidden="true"
        className="hidden grid-cols-12 gap-4 text-caption font-semibold tracking-widest text-muted-foreground uppercase md:grid"
      >
        <span className="col-span-4">{t('announced')}</span>
        <span className="col-span-1" />
        <span className="col-span-7 text-primary">{t('lands')}</span>
      </div>
      <ul
        {...target('items')}
        data-workshop-items=""
        className="focus-group focus-group--dim-others flex flex-col gap-4"
      >
        {PAIRS.map(({ key, tone }) => (
          <li key={key} className="focus-group__item grid grid-cols-1 items-center gap-2 md:grid-cols-12 md:gap-4">
            <div className="rounded-2xl border border-border bg-card px-6 py-5 text-subheading font-semibold shadow-sm md:col-span-4">
              {t(`pairs.${key}.term`)}
            </div>
            <svg viewBox="0 0 80 24" className="hidden h-6 w-full md:col-span-1 md:block" aria-hidden="true">
              <path
                d="M2 12h70M62 4l10 8-10 8"
                className={`fill-none ${LOOK[tone].arrow}`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className={`card-hover card-hover--raise flex items-center gap-5 rounded-2xl border border-l-8 px-6 py-5 md:col-span-7 ${LOOK[tone].card}`}
            >
              {ICONS[key]}
              <div>
                <p className="text-subheading font-semibold">{t(`pairs.${key}.lands`)}</p>
                <p className="text-body text-muted-foreground">{t(`pairs.${key}.detail`)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </SlideFrame>
  ),
});
