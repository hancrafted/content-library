import type { Section } from '@/episodes/components/slide-master/slide';
import { insideTheSkill } from '../slides/inside-the-skill/slide';
import { oneSkillOneJob } from '../slides/one-skill-one-job/slide';
import { whatGoesInside } from '../slides/what-goes-inside/slide';
import { whatGoesWhereIsInformationArchitecture } from '../slides/what-goes-where-is-information-architecture/slide';

export const whatGoesInsideSection: Section = [
  whatGoesInside,
  whatGoesWhereIsInformationArchitecture,
  oneSkillOneJob,
  insideTheSkill,
];
