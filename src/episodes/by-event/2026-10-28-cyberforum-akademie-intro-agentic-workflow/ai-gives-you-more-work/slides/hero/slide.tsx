import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { Staircase } from './staircase';

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  presentation: {
    tone: 'inverse',
    style: {
      '--slide-surface': 'color-mix(in oklab, var(--tone-paper) 88%, var(--tone-ink))',
      '--slide-space-after': '160px',
    },
    leave: { effect: 'liquid' },
  },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <div data-tone-flip className="flex flex-col gap-3 rounded-xl bg-muted p-6 md:max-w-3xl">
          <Staircase
            label={t('label')}
            axis={t('axis')}
            goal={t('goal')}
            standOn={2}
            steps={[
              { label: t('steps.farming'), rank: 1, tone: 'machine' },
              { label: t('steps.steam'), rank: 2, tone: 'machine' },
              { label: t('steps.computer'), rank: 3, tone: 'machine' },
              { label: t('steps.ai'), rank: 4, tone: 'ai', note: t('steps.aiNote') },
            ]}
          />
          <div className="flex flex-col justify-between gap-1 text-caption text-muted-foreground sm:flex-row sm:gap-4">
            <span>{t('legend')}</span>
            <span className="font-semibold text-foreground">{t('legendAi')}</span>
          </div>
        </div>
      </SlideFrame>
    </>
  ),
});
