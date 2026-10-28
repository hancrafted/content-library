import { slide } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A section slide that is not shown (`withoutSectionSlide`): it holds the Section's title for the table of contents.
export const play = slide({
  slug: 'play',
  messages: { en, de },
  content: () => null,
});
