import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { playSection } from './sections/play';
import { aboutSection } from './sections/why-how-and-what';
import { hero } from './slides/hero/slide';

export const softwareEcology = episode({
  slug: 'software-ecology',
  messages: { en, de },
  title: hero,
  sections: [playSection, aboutSection],
});
