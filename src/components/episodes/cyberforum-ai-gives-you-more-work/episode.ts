import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { fromExecutionToManagementSection } from './sections/from-execution-to-management';
import { hero } from './slides/hero/slide';

/*
 * The unlisted copy of `ai-gives-you-more-work` the CyberForum Akademie webinar (Event 2026-10-28-cyberforum-akademie-intro-agentic-workflow) presents: its Slides,
 * Sections and copy taken with `cp -r`, Slide slugs kept, so the composition can drift from the public Episode
 * without touching it (vision rule 4). It lives only under its Event (design-ADR 0016).
 *
 * Each Section is one placement marker under `sections/`, named after the Section's slug and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
export const cyberforumAiGivesYouMoreWork = episode({
  slug: 'cyberforum-ai-gives-you-more-work',
  messages: { en, de },
  title: hero,
  sections: [fromExecutionToManagementSection],
});
