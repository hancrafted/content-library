import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { SOFT_MIRROR } from '@/episodes/components/slide-master/surface';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  presentation: {
    inverse: true,
    surface: SOFT_MIRROR,
    style: {
      '--slide-space-after': '160px',
    },
    leave: { effect: 'liquid', style: { '--slide-transition-start-offset': '-160px' } },
  },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-6 grow">
        <p className="w-fit rounded-full bg-(--info)/15 px-4 py-1 text-caption font-semibold tracking-widest text-(--info) uppercase">
          {t('kicker')}
        </p>
      </SlideFrame>
    </>
  ),
});
