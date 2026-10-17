import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "How to start doing sales": the Slide header names the Section; the Scene stays empty.
export const howToStartDoingSales = slide({
  slug: 'how-to-start-doing-sales',
  messages: { en, de },
  segments: [{ slug: 'backward-chaining' }, { slug: 'the-claim' }, { slug: 'signposting' }],
  content: () => null,
});
