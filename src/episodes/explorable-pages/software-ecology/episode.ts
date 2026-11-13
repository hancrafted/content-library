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
  // Needs human: approve the `description` in i18n/{en,de}.json; it is written from the Brief, not taken from it.
  messages: { en, de },
  title: hero,
  sections: [playSection, aboutSection],
});
