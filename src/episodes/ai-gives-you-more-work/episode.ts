import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { fromExecutionToManagementSection } from './sections/from-execution-to-management';
import { hero } from './slides/hero/slide';

/*
 * "Will AI reduce your work? It adds work: managing it.": AI takes over the execution and promotes you into
 * management, which lets one person take on far more complex tasks. Built from the approved Spec under
 * docs/episodes/ai-gives-you-more-work/. Upcoming until its video is live.
 *
 * Each Section is one placement marker under `sections/`, named after the Section's slug and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
export const aiGivesYouMoreWork = episode({
  slug: 'ai-gives-you-more-work',
  messages: { en, de },
  title: hero,
  sections: [fromExecutionToManagementSection],
});
