import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { elements } from './sections/elements';

export const iceBerg = episode({
  slug: 'ice-berg',
  messages: { en, de },
  tocEntrance: 'visible-from-start',
  sections: [elements],
});
