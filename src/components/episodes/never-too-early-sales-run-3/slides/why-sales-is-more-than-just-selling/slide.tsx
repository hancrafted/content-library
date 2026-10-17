import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Why sales is more than just selling": the Slide header names the Section; the Scene stays empty.
export const whySalesIsMoreThanJustSelling = slide({
  slug: 'why-sales-is-more-than-just-selling',
  messages: { en, de },
  segments: [{ slug: 'pain-first' }, { slug: 'the-claim' }],
  content: () => null,
});
