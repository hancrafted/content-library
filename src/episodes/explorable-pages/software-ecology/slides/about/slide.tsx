import { slide } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The Section `about`'s section slide: it holds the Section's title and its Voice script. The Why, how and what Section's job lists
// its page Slides after it in `sections/why-how-and-what.ts` and then hides it with `withoutSectionSlide`.
export const about = slide({
  slug: 'about',
  messages: { en, de },
  segments: [{ slug: 'why-you-may-leave-it' }],
  content: () => null,
});
