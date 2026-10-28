import type { Section } from '@/episodes/components/slide-master/slide';
import { aiDisciplinesPresets } from '../slides/ai-disciplines/slide';
import { timeline } from '../slides/timeline/slide';

/** The Section "Presets": the section slide, then the timeline Preset with its readme on the Slide. */
export const aiDisciplinesSection: Section = [aiDisciplinesPresets, timeline];
