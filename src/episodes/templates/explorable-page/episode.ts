import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { hookSection } from './sections/hook';
import { howToUseItSection } from './sections/how-to-use-it';
import { whatItIsSection } from './sections/what-it-is';
import { whyItMattersSection } from './sections/why-it-matters';

/*
 * The Explorable page template (docs/features/explorables/README.md, "Page convention"): the copy source for a new
 * Explorable page. The Title slide reads the title and caption in `i18n/`, and the title states the payoff; then a hook
 * Section that lands the value in its first Slides (the Short framing), what it is, why it matters, and how to use it,
 * ending on the primary Explorable with every option on. Every word is a placeholder, and the structure is convention,
 * not enforced. The hook and how-to-use Sections have their section slide switched off, where it would repeat the title.
 * A Template, not an Explorable page: the copy gets its own record (slug = its Explorable's slug) when it is registered.
 */
export const explorablePageTemplate = episode({
  slug: 'explorable-page',
  messages: { en, de },
  sections: [hookSection, whatItIsSection, whyItMattersSection, howToUseItSection],
});
