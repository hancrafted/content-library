import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { managingTheAttentionSpanSection } from './sections/managing-the-attention-span';
import { theAisAttentionSpanSection } from './sections/the-ais-attention-span';
import { thoughtExperimentSection } from './sections/thought-experiment';
import { whatFillsTheWindowSection } from './sections/what-fills-the-window';
import { hero } from './slides/hero/slide';

/*
 * The unlisted copy of `ai-attention-span` the AXEL seminar (Event 2026-10-23-axel-agentic-workflow) presented: its Slides,
 * Sections and copy taken with `cp -r`, Slide slugs kept, so the composition can drift from the public Episode
 * without touching it (vision rule 4). It lives only under its Event (design-ADR 0016).
 *
 * Each Section is one placement marker under `sections/`, named after the Section's slug and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
export const axelAiAttentionSpan = episode({
  slug: 'ai-attention-span',
  messages: { en, de },
  title: hero,
  sections: [
    thoughtExperimentSection,
    theAisAttentionSpanSection,
    whatFillsTheWindowSection,
    managingTheAttentionSpanSection,
  ],
});
