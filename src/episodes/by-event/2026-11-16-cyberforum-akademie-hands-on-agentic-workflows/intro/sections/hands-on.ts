import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { askAiForHelp } from '../slides/ask-ai-for-help/slide';
import { handsOn } from '../slides/hands-on/slide';
import { makeItASkill } from '../slides/make-it-a-skill/slide';
import { specAndQuizPage } from '../slides/spec-and-quiz-page/slide';
import { startTheInterview } from '../slides/start-the-interview/slide';
import { todaysQuiz } from '../slides/todays-quiz/slide';

/**
 * The Section `hands-on`: the day's quiz Workflow, step by step, its section slide kept for the title but not shown.
 * Today's quiz takes the anchor `hands-on`; each step its own (`hands-on--start-the-interview`), which the Event's
 * Playlist opens in the order the day runs.
 */
export const handsOnSection: Section = withoutSectionSlide([
  handsOn,
  todaysQuiz,
  askAiForHelp,
  startTheInterview,
  specAndQuizPage,
  makeItASkill,
]);
