import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { VisitorBadge } from '@/components/slide-shared/visitor-badge/visitor-badge';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

const MOVES = ['break', 'requirements', 'interview', 'evaluate', 'fresh'] as const;

// The section slide of "How do we work with this freelancer?": the Hero motif's badge, worn by AI, with the five BRIEF
// moves clipped to it as pills, each first letter semibold.
export const fiveMovesToBriefAFreelancer = slide({
  slug: 'five-moves-to-brief-a-freelancer',
  messages: { en, de },
  segments: [{ slug: 'answer-to-the-traits' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-3xl flex-col items-start gap-6 sm:flex-row">
        <VisitorBadge job={t('aiBadge.job')} day={t('aiBadge.day')} ai compact className="w-full rotate-1 sm:w-1/3" />
        <ol className="flex flex-1 flex-col gap-2 text-body" aria-label={t('movesLabel')}>
          {MOVES.map((move) => (
            <li key={move} className="rounded-full border border-border bg-card px-4 py-1">
              {t.rich(`moves.${move}`, {
                initial: (chunks: ReactNode) => <span className="font-semibold">{chunks}</span>,
              })}
            </li>
          ))}
        </ol>
      </div>
    </SlideFrame>
  ),
});
