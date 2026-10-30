import type { Section } from '@/episodes/components/slide-master/slide';
import { installYourAiAgent } from '../slides/install-your-ai-agent/slide';
import { logIn } from '../slides/log-in/slide';
import { yourAiAgent } from '../slides/your-ai-agent/slide';

/** Placement marker of the Section "Your AI agent": its section slide, then its page Slides in Spec order. */
export const yourAiAgentSection: Section = [yourAiAgent, installYourAiAgent, logIn];
