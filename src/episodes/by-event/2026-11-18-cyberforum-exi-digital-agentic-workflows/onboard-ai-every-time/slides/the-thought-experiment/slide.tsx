import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { VisitorBadge } from '@/episodes/components/slide-shared/visitor-badge/visitor-badge';
import { cn } from '@/shared/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';

const QUESTIONS = ['budget', 'signOff', 'lastTime'] as const;

// The section slide of "The thought experiment": the Hero motif's badge pinned on you, neutral because this Section
// names no AI, beside three questions a new hire needs answered; the forgotten one is dashed and semibold.
export const theThoughtExperiment = slide({
  slug: 'the-thought-experiment',
  messages: { en, de },
  segments: [{ slug: 'hook-new-job' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-3xl flex-col items-start gap-6 sm:flex-row">
        <VisitorBadge
          job={t('newHire.job')}
          day={t('newHire.day')}
          ai={false}
          compact
          className="w-full -rotate-1 sm:w-2/5"
        />
        <ul className="flex flex-1 flex-col gap-2 text-body" aria-label={t('questionsLabel')}>
          {QUESTIONS.map((question) => (
            <li
              key={question}
              className={cn(
                'rounded-full border bg-card px-4 py-1',
                question === 'lastTime' ? 'border-dashed border-foreground font-semibold' : 'border-border',
              )}
            >
              {t(`questions.${question}`)}
            </li>
          ))}
        </ul>
      </div>
    </SlideFrame>
  ),
});
