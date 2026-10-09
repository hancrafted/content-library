import { episode } from '@/components/slide-master/episode-record';
import { blankEveryTime } from './slides/blank-every-time';
import { blankSlate } from './slides/blank-slate';
import { briefAndRules } from './slides/brief-and-rules';
import { decisionsInWriting } from './slides/decisions-in-writing';
import { enforceAndVerify } from './slides/enforce-and-verify';
import { keepItShort } from './slides/keep-it-short';
import { metaphorBreaks } from './slides/metaphor-breaks';
import { onboarding } from './slides/onboarding';
import { oneLine } from './slides/one-line';
import { whereItBreaks } from './slides/where-it-breaks';
import { whereKnowledgeLives } from './slides/where-knowledge-lives';

/*
 * The dogfood Episode: "Treat AI like an amnesiac freelancer you have to
 * onboard". Three Sections holding 2, 3 and 3 Slides after their section
 * slide, modelled on the reference Episode (page-template). Every claim traces
 * to docs/research/ai-amnesia-mechanics.md and ai-onboarding-freelancer.md;
 * "amnesiac" is our metaphor, not a vendor term. Keys live under
 * `episodes.amnesiac-freelancer.slides.<slide>` (docs/agents/episode-translation-keys.md).
 */
export const amnesiacFreelancer = episode({
  slug: 'amnesiac-freelancer',
  sections: [
    [blankSlate, blankEveryTime, whereKnowledgeLives],
    [onboarding, briefAndRules, keepItShort, decisionsInWriting],
    [whereItBreaks, metaphorBreaks, enforceAndVerify, oneLine],
  ],
});
