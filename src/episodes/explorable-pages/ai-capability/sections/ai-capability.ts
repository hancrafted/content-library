import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { aiCapabilityPresets } from '../slides/ai-disciplines/slide';
import { timeline } from '../slides/timeline/slide';

/** The Section "Presets": its section slide kept for the title but not shown, then the timeline Preset with its readme on the Slide. */
export const aiCapabilitySection: Section = withoutSectionSlide([aiCapabilityPresets, timeline]);
