import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { blankEveryTime } from './slides/blank-every-time/slide';
import { blankSlate } from './slides/blank-slate/slide';
import { briefAndRules } from './slides/brief-and-rules/slide';
import { decisionsInWriting } from './slides/decisions-in-writing/slide';
import { enforceAndVerify } from './slides/enforce-and-verify/slide';
import { keepItShort } from './slides/keep-it-short/slide';
import { metaphorBreaks } from './slides/metaphor-breaks/slide';
import { onboarding } from './slides/onboarding/slide';
import { oneLine } from './slides/one-line/slide';
import { whereItBreaks } from './slides/where-it-breaks/slide';
import { whereKnowledgeLives } from './slides/where-knowledge-lives/slide';

/*
 * The dogfood Episode: "Treat AI like an amnesiac freelancer you have to
 * onboard". Three Sections holding 2, 3 and 3 Slides after their section
 * slide, modelled on the reference Episode (page-template). Every claim traces
 * to docs/research/ai-amnesia-mechanics.md and ai-onboarding-freelancer.md;
 * "amnesiac" is our metaphor, not a vendor term. Each Slide is one folder under
 * `slides/` holding its own Translation files; the Episode's title, caption
 * and description sit in `i18n/`.
 */
export const amnesiacFreelancer = episode({
  slug: 'amnesiac-freelancer',
  messages: { en, de },
  header: 'authored',
  sections: [
    [blankSlate, blankEveryTime, whereKnowledgeLives],
    [onboarding, briefAndRules, keepItShort, decisionsInWriting],
    [whereItBreaks, metaphorBreaks, enforceAndVerify, oneLine],
  ],
});
