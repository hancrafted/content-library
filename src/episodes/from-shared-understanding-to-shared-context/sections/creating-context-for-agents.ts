import type { Section } from '@/episodes/components/slide-master/slide';
import { brief } from '../slides/brief/slide';
import { creatingContextForAgents } from '../slides/creating-context-for-agents/slide';
import { grillMe } from '../slides/grill-me/slide';
import { metaPrompting } from '../slides/meta-prompting/slide';

/** Placement marker of the Section "Creating context for agents": its Slides in Spec order, section slide first. */
export const creatingContextForAgentsSection: Section = [creatingContextForAgents, metaPrompting, grillMe, brief];
