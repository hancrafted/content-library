import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aboutSection } from './sections/about';
import { playSection } from './sections/play';

// spec: docs/features/explorables/README.md#page-convention
export const explorablePageTemplate = episode({
  slug: 'explorable-page',
  messages: { en, de },
  sections: [playSection, aboutSection],
});
