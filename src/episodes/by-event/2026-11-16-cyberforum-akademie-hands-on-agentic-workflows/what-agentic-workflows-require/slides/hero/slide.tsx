import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GoalSum } from './goal-sum';
import de from './i18n/de.json';
import en from './i18n/en.json';

const NUMBERS = [1, 2, 3, 4] as const;

/**
 * The Title slide's hero Scene (the record's `title`), picked Option B: the problem as a picture, abstract and almost
 * wordless. Four ticked, numbered cards and a broken goal; "Goal" is its only word, so no summer party shows before the
 * first Section tells it. The shared header renders the `h1` and this Slide's caption above it. The empty Backdrop is
 * the Title slide's one Backdrop, holding no glow.
 */
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
