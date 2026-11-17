import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { foundations } from './slides/foundations/slide';
import { hero } from './slides/hero/slide';
import { nextSteps } from './slides/next-steps/slide';
import { whatComesNext } from './slides/what-comes-next/slide';
import { whyATemplate } from './slides/why-a-template/slide';

// decision: FE-002 §2
export const episodeTemplate = episode({
  slug: 'episode-template',
  messages: { en, de },
  title: hero,
  sections: [
    [foundations, whyATemplate],
    [nextSteps, whatComesNext],
  ],
});
