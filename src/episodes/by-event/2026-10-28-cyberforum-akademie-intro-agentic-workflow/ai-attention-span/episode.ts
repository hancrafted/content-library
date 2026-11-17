import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { managingTheAttentionSpanSection } from './sections/managing-the-attention-span';
import { theAisAttentionSpanSection } from './sections/the-ais-attention-span';
import { thoughtExperimentSection } from './sections/thought-experiment';
import { whatFillsTheWindowSection } from './sections/what-fills-the-window';
import { hero } from './slides/hero/slide';

// decision: docs/adr/0016-content-data-model.md
export const cyberforumAiAttentionSpan = episode({
  slug: 'ai-attention-span',
  messages: { en, de },
  title: hero,
  notes: [{ slug: 'check-in', target: 'title' }],
  sections: [
    thoughtExperimentSection,
    theAisAttentionSpanSection,
    whatFillsTheWindowSection,
    managingTheAttentionSpanSection,
  ],
});
