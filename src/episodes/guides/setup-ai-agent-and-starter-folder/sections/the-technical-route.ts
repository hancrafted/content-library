import type { Section } from '@/episodes/components/slide-master/slide';
import { setUpTheMattPocockSkillsYourself } from '../slides/set-up-the-matt-pocock-skills-yourself/slide';
import { theTechnicalRoute } from '../slides/the-technical-route/slide';

/** Placement marker of the Section "The technical route": its section slide, then its page Slides in Spec order. */
export const theTechnicalRouteSection: Section = [theTechnicalRoute, setUpTheMattPocockSkillsYourself];
