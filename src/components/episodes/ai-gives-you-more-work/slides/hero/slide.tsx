import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { Staircase } from './staircase';

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif: the climb, a staircase of revolutions on a
 * quiet wall under the Episode's `h1` and this Slide's caption, which the Title slide shows. The person stands on the
 * computer step facing the tallest one, AI, under "Managing it". The section slide echoes it by typography alone.
 * The empty Backdrop is the Title slide's one Backdrop, holding no glow.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <div className="flex flex-col gap-3 rounded-xl bg-muted p-6 md:max-w-3xl">
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
