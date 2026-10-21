import type { Section } from '@/components/slide-master/slide';
import { aiForgetsTheMiddleToo } from '../slides/ai-forgets-the-middle-too/slide';
import { theLongPhoneCallStory } from '../slides/the-long-phone-call-story/slide';
import { theLongPhoneCall } from '../slides/the-long-phone-call/slide';

/** Placement marker of the Section "The long phone call": its Slides in Spec order, section slide first. */
export const theLongPhoneCallSection: Section = [theLongPhoneCall, theLongPhoneCallStory, aiForgetsTheMiddleToo];
