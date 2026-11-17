import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { fromExecutionToManagementSection } from './sections/from-execution-to-management';
import { hero } from './slides/hero/slide';

export const aiGivesYouMoreWork = episode({
  slug: 'ai-gives-you-more-work',
  messages: { en, de },
  title: hero,
  sections: [fromExecutionToManagementSection],
});
