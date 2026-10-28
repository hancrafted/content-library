import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aboutSection } from './sections/about';
import { playSection } from './sections/play';

/*
 * The Context window Explorable as a Template (design-ADR 0019): a Title slide, then the Explorable with every option on, then Why, How and What. A change to the explanation is previewed here before it reaches an
 * Episode, the browser lane runs against it, and one Slide's anchor is a link to send on its own.
 */
export const contextWindow = episode({
  slug: 'context-window',
  messages: { en, de },
  sections: [playSection, aboutSection],
});
