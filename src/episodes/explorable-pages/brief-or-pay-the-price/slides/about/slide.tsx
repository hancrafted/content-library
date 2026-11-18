import { slide } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const about = slide({
  slug: 'about',
  messages: { en, de },
  content: () => null,
});
