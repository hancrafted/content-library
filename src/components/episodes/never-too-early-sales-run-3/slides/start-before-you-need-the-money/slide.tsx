import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Start before you need the money": the Slide header names the Section; the Scene stays empty.
export const startBeforeYouNeedTheMoney = slide({
  slug: 'start-before-you-need-the-money',
  messages: { en, de },
  segments: [{ slug: 'back-to-the-wall' }, { slug: 'peak-end-close' }],
  content: () => null,
});
