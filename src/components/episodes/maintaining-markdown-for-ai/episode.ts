import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import './palette.css';
import { deterministicCore } from './slides/deterministic-core/slide';
import { featureRoadmap } from './slides/feature-roadmap/slide';
import { googleOkf } from './slides/google-okf/slide';
import { liveDemo } from './slides/live-demo/slide';
import { markdownInAiWorkflows } from './slides/markdown-in-ai-workflows/slide';
import { steeringTheAi } from './slides/steering-the-ai/slide';
import { theVerifyingHalfIsYours } from './slides/the-verifying-half-is-yours/slide';
import { volumeOutrunsReview } from './slides/volume-outruns-review/slide';
import { whatAiAccelerates } from './slides/what-ai-accelerates/slide';
import { whatRemainsHuman } from './slides/what-remains-human/slide';
import { whatTheMachineVerifies } from './slides/what-the-machine-verifies/slide';
import { whereTheEffortGoes } from './slides/where-the-effort-goes/slide';

export const maintainingMarkdownForAi = episode({
  slug: 'maintaining-markdown-for-ai',
  youtube: { en: 'YxCVw4bUbW0', de: 'YxCVw4bUbW0' },
  messages: { en, de },
  header: 'authored',
  sections: [
    [markdownInAiWorkflows],
    [volumeOutrunsReview],
    [whereTheEffortGoes, whatTheMachineVerifies, whatAiAccelerates, whatRemainsHuman],
    [googleOkf],
    [steeringTheAi, deterministicCore, liveDemo, featureRoadmap],
    [theVerifyingHalfIsYours],
  ],
});
