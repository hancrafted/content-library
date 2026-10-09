import { episode } from '@/components/slide-master/episode-record';
import { deterministicCore } from './slides/deterministic-core';
import { featureRoadmap } from './slides/feature-roadmap';
import { googleOkf } from './slides/google-okf';
import { liveDemo } from './slides/live-demo';
import { markdownInAiWorkflows } from './slides/markdown-in-ai-workflows';
import { steeringTheAi } from './slides/steering-the-ai';
import { theVerifyingHalfIsYours } from './slides/the-verifying-half-is-yours';
import { volumeOutrunsReview } from './slides/volume-outruns-review';
import { whatAiAccelerates } from './slides/what-ai-accelerates';
import { whatRemainsHuman } from './slides/what-remains-human';
import { whatTheMachineVerifies } from './slides/what-the-machine-verifies';
import { whereTheEffortGoes } from './slides/where-the-effort-goes';

export const maintainingMarkdownForAi = episode({
  slug: 'maintaining-markdown-for-ai',
  youtube: { en: 'YxCVw4bUbW0', de: 'YxCVw4bUbW0' },
  sections: [
    [markdownInAiWorkflows],
    [volumeOutrunsReview],
    [whereTheEffortGoes, whatTheMachineVerifies, whatAiAccelerates, whatRemainsHuman],
    [googleOkf],
    [steeringTheAi, deterministicCore, liveDemo, featureRoadmap],
    [theVerifyingHalfIsYours],
  ],
});
