import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { askAiForHelp } from '../slides/ask-ai-for-help/slide';
import { handsOn } from '../slides/hands-on/slide';
import { makeItASkill } from '../slides/make-it-a-skill/slide';
import { specAndQuizPage } from '../slides/spec-and-quiz-page/slide';
import { startTheInterview } from '../slides/start-the-interview/slide';
import { todaysQuiz } from '../slides/todays-quiz/slide';

export const handsOnSection: Section = withoutSectionSlide([
  handsOn,
  todaysQuiz,
  askAiForHelp,
  startTheInterview,
  specAndQuizPage,
  makeItASkill,
]);
