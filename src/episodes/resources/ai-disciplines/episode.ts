import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aiDisciplinesSection } from './sections/ai-disciplines';

/*
 * The AI disciplines Explorable explanation as a Resource (design-ADR 0019): a Title slide, then one Section whose
 * Slides each show the explanation in a Preset. A change to the explanation is previewed here before it reaches an
 * Episode, and one Slide's anchor is a link to send on its own.
 */
export const aiDisciplines = episode({
  slug: 'ai-disciplines',
  messages: { en, de },
  sections: [aiDisciplinesSection],
});
