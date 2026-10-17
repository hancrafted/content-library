import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The Title slide's hero Scene (the record's `title`): an empty Backdrop, so the Title slide shows no shared glow. Two
// spacers in the Slide's column, one ordered before the Slide header, centre the Episode's `h1` and caption in the
// viewport.
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: () => (
    <>
      <SlideBackdrop mobile />
      <div aria-hidden="true" className="-order-1 flex-1" />
      <div aria-hidden="true" className="flex-1 pb-16 md:pb-24" />
    </>
  ),
});
