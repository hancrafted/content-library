import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { playSection } from './sections/play';
import { aboutSection } from './sections/why-how-and-what';
import { hero } from './slides/hero/slide';

/*
 * The Software ecology Explorable page: a Title slide, then the factory with every option on, then Why, How and What.
 * Each Section is its own module, so the Section jobs build in parallel without touching one file.
 */
export const softwareEcology = episode({
  slug: 'software-ecology',
  messages: { en, de },
  title: hero,
  sections: [playSection, aboutSection],
});
