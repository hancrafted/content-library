import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { managingTheAttentionSpanSection } from './sections/managing-the-attention-span';
import { theAisAttentionSpanSection } from './sections/the-ais-attention-span';
import { thoughtExperimentSection } from './sections/thought-experiment';
import { whatFillsTheWindowSection } from './sections/what-fills-the-window';
import { hero } from './slides/hero/slide';

export const aiAttentionSpan = episode({
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
