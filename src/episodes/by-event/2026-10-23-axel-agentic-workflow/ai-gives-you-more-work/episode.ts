import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { fromExecutionToManagementSection } from './sections/from-execution-to-management';
import { hero } from './slides/hero/slide';

// decision: docs/adr/0016-content-data-model.md
export const axelAiGivesYouMoreWork = episode({
  slug: 'ai-gives-you-more-work',
  messages: { en, de },
  title: hero,
  sections: [fromExecutionToManagementSection],
});
