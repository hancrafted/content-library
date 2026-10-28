import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aboutSection } from './sections/about';
import { playSection } from './sections/play';

/*
 * The AI capability Explorable as a Template (design-ADR 0019): a Title slide, then Why, How and What, then the Explorable with every option on. A change to the explanation is previewed here before it reaches an
 * Episode, and one Slide's anchor is a link to send on its own.
 */
export const aiCapability = episode({
  slug: 'ai-capability',
  messages: { en, de },
  sections: [aboutSection, playSection],
});
