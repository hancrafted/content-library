import type { Section } from '@/episodes/components/slide-master/slide';
import { besideTheSkill } from '../slides/beside-the-skill/slide';
import { howGrillMeAndGrillWithDocsWork } from '../slides/how-grill-me-and-grill-with-docs-work/slide';
import { whatStaysBeside } from '../slides/what-stays-beside/slide';
import { whoUsesItAndWhere } from '../slides/who-uses-it-and-where/slide';

/** Placement marker of the Section "What stays beside": its Slides in Spec order, section slide first. */
export const whatStaysBesideSection: Section = [
  whatStaysBeside,
  besideTheSkill,
  whoUsesItAndWhere,
  howGrillMeAndGrillWithDocsWork,
];
