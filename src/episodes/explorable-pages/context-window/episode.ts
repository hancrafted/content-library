import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { contextWindowSection } from './sections/context-window';

/*
 * The Context window Explorable as a Template (design-ADR 0019): a Title slide, then one Section whose
 * Slides each show the explanation in a Preset. A change to the explanation is previewed here before it reaches an
 * Episode, the browser lane runs against it, and one Slide's anchor is a link to send on its own.
 */
export const contextWindow = episode({
  slug: 'context-window',
  messages: { en, de },
  sections: [contextWindowSection],
});
