import type { Section } from '@/episodes/components/slide-master/slide';
import { aiDisciplinesPresets } from '../slides/ai-disciplines/slide';
import { recap } from '../slides/recap/slide';
import { timeline } from '../slides/timeline/slide';

/** The Section "Presets": the section slide, then one Slide per Preset, each with its readme on the Slide. */
export const aiDisciplinesSection: Section = [aiDisciplinesPresets, timeline, recap];
