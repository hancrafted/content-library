import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`): the webinar's format and date, nothing else, so the title is
 * the one thing to read. The frame grows into the free space below, which lifts the title towards the Event's
 * breadcrumb instead of centring it in the viewport. The empty Backdrop is the Title slide's one Backdrop, holding no glow.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
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
