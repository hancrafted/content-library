import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

const VENUES = ['a', 'b', 'c'] as const;

// The section slide of "BRIEF in action": the signed-off requirements card fans out through a hairline into three
// Day 1 rows ringed in `ai`, one fresh chat per venue: the Hero motif's badges, forgetting now on purpose.
export const briefInAction = slide({
  slug: 'brief-in-action',
  messages: { en, de },
  segments: [{ slug: 'one-task-five-moves' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="grid max-w-3xl grid-cols-12 items-center gap-2">
        <div className="col-span-5 rounded-xl border border-foreground bg-card p-3 text-body">
          <p className="font-semibold">{t('requirementsCard.title')}</p>
          <p className="text-caption text-muted-foreground">{t('requirementsCard.status')}</p>
        </div>
        <svg viewBox="0 0 40 90" className="col-span-1 w-full" aria-hidden="true">
          <path
            d="M0 45 C20 45 20 10 40 10 M0 45 L40 45 M0 45 C20 45 20 80 40 80"
            className="fill-none stroke-primary"
            strokeWidth="1.5"
          />
        </svg>
        <ol className="col-span-6 flex flex-col gap-2 text-body" aria-label={t('venuesLabel')}>
          {VENUES.map((venue) => (
            <li
              key={venue}
              className="flex justify-between gap-2 rounded-lg border border-border bg-card px-3 py-1 ring-1 ring-ai/40"
            >
              <span>{t(`venues.${venue}`)}</span>
              <span className="font-semibold">{t('day')}</span>
            </li>
          ))}
        </ol>
      </div>
    </SlideFrame>
  ),
});
