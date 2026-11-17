import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aboutSection } from './sections/about';
import { playSection } from './sections/play';
import { hero } from './slides/hero/slide';

// decision: docs/adr/0019-resources-overview.md
export const aiCapability = episode({
  slug: 'ai-capability',
  messages: { en, de },
  title: hero,
  sections: [playSection, aboutSection],
});
