import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { fiveMovesToBriefAFreelancerSection } from './sections/five-moves-to-brief-a-freelancer';
import { theThoughtExperimentSection } from './sections/the-thought-experiment';
import { hero } from './slides/hero/slide';

/*
 * The unlisted copy of `onboard-ai-every-time` the AXEL seminar (Event 2026-10-23-axel-agentic-workflow) presented: its Slides,
 * Sections and copy taken with `cp -r`, Slide slugs kept, so the composition can drift from the public Episode
 * without touching it (vision rule 4). It lives only under its Event (design-ADR 0016).
 *
 * Each Section is one placement marker under `sections/`, named after the Section's slug and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
export const axelOnboardAiEveryTime = episode({
  slug: 'onboard-ai-every-time',
  messages: { en, de },
  title: hero,
  segments: [{ slug: 'welcome' }],
  sections: [theThoughtExperimentSection, fiveMovesToBriefAFreelancerSection],
});
