import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GoalSum } from './goal-sum';
import de from './i18n/de.json';
import en from './i18n/en.json';

const NUMBERS = [1, 2, 3, 4] as const;

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <GoalSum
          label={t('scene')}
          cards={NUMBERS.map((number) => ({ number, doneBy: t('doneByPerson'), done: t('done') }))}
          goal={t('goal')}
          broken={t('broken')}
        />
      </SlideFrame>
    </>
  ),
});
