import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aboutSection } from './sections/about';
import { playSection } from './sections/play';
import { hero } from './slides/hero/slide';

// spec: docs/features/explorables/README.md#page-convention
export const briefOrPayThePrice = episode({
  slug: 'brief-or-pay-the-price',
  messages: { en, de },
  title: hero,
  sections: [playSection, aboutSection],
});
