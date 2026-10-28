import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aboutSection } from './sections/about';
import { playSection } from './sections/play';

/*
 * The Explorable page template (docs/features/explorables/README.md, "Page convention"): the copy source for a new
 * Explorable page. The Title slide reads the title and caption in `i18n/`, and the title states the payoff; then the
 * Section `about` (Why, How and What on one Slide, each claim with a cited Speaker note), then the Section `play`
 * (the primary Explorable with every option on). Every word is a placeholder, and the structure is convention, not
 * enforced. Both Sections have their section slide switched off, where it would repeat the title.
 * A Template, not an Explorable page: the copy gets its own record (slug = its Explorable's slug) when it is registered.
 */
export const explorablePageTemplate = episode({
  slug: 'explorable-page',
  messages: { en, de },
  sections: [aboutSection, playSection],
});
