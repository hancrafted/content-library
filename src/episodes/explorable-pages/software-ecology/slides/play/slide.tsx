import { slide } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The Section `play`'s section slide: it holds the Section's title and its Voice script. The Play Section's job lists
// its page Slides after it in `sections/play.ts` and then hides it with `withoutSectionSlide`.
export const play = slide({
  slug: 'play',
  messages: { en, de },
  segments: [{ slug: 'you-know-this-cartoon' }, { slug: 'the-factory-runs-live' }],
  content: () => null,
});
