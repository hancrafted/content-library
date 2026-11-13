import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { BikeBench } from '@/episodes/components/slide-shared/bike-bench/bike-bench';
import type { ReactNode } from 'react';
import { BenchJobs } from './bench-jobs';
import { BenchSorted } from './bench-sorted';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MoreIsNotSafer } from './more-is-not-safer';

const WRITTEN_REQUIREMENTS = {
  slug: 'written-requirements-reduce-variance',
  url: 'https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/AIE/AIE-0008__written-requirements-reduce-variance/research.md',
};
const GLOAGUEN = { slug: 'gloaguen-evaluating-agents-md', url: 'https://arxiv.org/abs/2602.11988' };

const PILL =
  'absolute top-[83%] -translate-x-1/2 rounded-full px-3 py-1 text-caption font-medium whitespace-nowrap shadow-md';

/**
 * "You run the bench" (Spec Option 10a): the bench with you in front, handing a part to the AI worker beside you over
 * the hand-over arc in `primary`, what you put on the bench and held back under it, and your two jobs beside it.
 * Keeps `basic-page` and `motion: none`; the stat card reveals its detail on hover.
 */
export const youRunTheBench = slide({
  slug: 'you-run-the-bench',
  messages: { en, de },
  notes: [{ slug: 'more-is-not-safer', target: 'stat', sources: [WRITTEN_REQUIREMENTS, GLOAGUEN] }],
  segments: [{ slug: 'human-manages-the-context' }, { slug: 'not-how-the-ai-works-inside' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8">
      <div className="grid gap-6 @4xl:grid-cols-12">
        <div className="flex flex-col justify-center gap-4 rounded-xl bg-muted p-5 shadow-md @4xl:col-span-8">
          <div className="relative">
            <BikeBench label={t('drawing')} arrivals worker="human-and-ai" />
            <span className={`${PILL} left-[30%] bg-human text-background`}>{t('you')}</span>
            <span className={`${PILL} left-[56%] bg-ai text-background`}>{t('ai')}</span>
          </div>
          <BenchSorted
            onBench={{ label: t('onBench.label'), text: t('onBench.text') }}
            heldBack={{ label: t('heldBack.label'), text: t('heldBack.text') }}
          />
        </div>
        <div className="flex flex-col gap-4 @4xl:col-span-4">
          <BenchJobs
            yours={{
              label: t('yours.label'),
              items: (['bench', 'heading'] as const).map((item) => ({
                title: t(`yours.items.${item}.title`),
                hint: t(`yours.items.${item}.hint`),
              })),
            }}
            notYours={{ label: t('notYours.label'), text: t('notYours.text') }}
          />
          <MoreIsNotSafer
            target={target('stat')}
            label={t('stat.label')}
            marker={<Marker note="more-is-not-safer" placement="beside" />}
            alone={t.rich('stat.alone', {
              figure: (chunks: ReactNode) => <span className="font-semibold text-primary">{chunks}</span>,
            })}
            together={t.rich('stat.together', {
              figure: (chunks: ReactNode) => <span className="font-semibold text-(--warning)">{chunks}</span>,
            })}
            detail={t('stat.detail')}
          />
        </div>
      </div>
    </SlideFrame>
  ),
});
