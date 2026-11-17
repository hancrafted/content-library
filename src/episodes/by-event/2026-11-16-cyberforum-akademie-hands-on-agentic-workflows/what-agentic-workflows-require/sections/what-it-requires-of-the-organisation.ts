import type { Section } from '@/episodes/components/slide-master/slide';
import { designedAiFirst } from '../slides/designed-ai-first/slide';
import { fromArticleToQuiz } from '../slides/from-article-to-quiz/slide';
import { theOrgChartTrap } from '../slides/the-org-chart-trap/slide';
import { whatItRequiresOfTheOrganisation } from '../slides/what-it-requires-of-the-organisation/slide';
import { whatToLookForInYourTeam } from '../slides/what-to-look-for-in-your-team/slide';

export const whatItRequiresOfTheOrganisationSection: Section = [
  whatItRequiresOfTheOrganisation,
  theOrgChartTrap,
  designedAiFirst,
  whatToLookForInYourTeam,
  fromArticleToQuiz,
];
