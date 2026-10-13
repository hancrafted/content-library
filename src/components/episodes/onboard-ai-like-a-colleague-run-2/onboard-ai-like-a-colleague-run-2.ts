import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aColleagueWhoKnowsTheWrittenWorld } from './slides/a-colleague-who-knows-the-written-world/slide';
import { confidentIsNotCorrect } from './slides/confident-is-not-correct/slide';
import { dayOneWithACapableStranger } from './slides/day-one-with-a-capable-stranger/slide';
import { fourDisciplinesOneLineEach } from './slides/four-disciplines-one-line-each/slide';
import { fourWaysToOnboardAi } from './slides/four-ways-to-onboard-ai/slide';
import { fromYourDeskToYourOrganization } from './slides/from-your-desk-to-your-organization/slide';
import { itFeelsLikeALot } from './slides/it-feels-like-a-lot/slide';
import { promptingLikeATool } from './slides/prompting-like-a-tool/slide';
import { theEffortMovesItDoesNotVanish } from './slides/the-effort-moves-it-does-not-vanish/slide';
import { thePlanIsDueByEndOfDay } from './slides/the-plan-is-due-by-end-of-day/slide';
import { thePromiseAndTheGap } from './slides/the-promise-and-the-gap/slide';
import { theTwist } from './slides/the-twist/slide';
import { theWorkRelocates } from './slides/the-work-relocates/slide';
import { twentyTimesOnPaper } from './slides/twenty-times-on-paper/slide';
import { whatWouldYouTellThemFirst } from './slides/what-would-you-tell-them-first/slide';
import { youManagedItYouDidNotDoIt } from './slides/you-managed-it-you-did-not-do-it/slide';
import { youManagedTheTask } from './slides/you-managed-the-task/slide';
import { yourDayOneNoteBeforeYouType } from './slides/your-day-one-note-before-you-type/slide';

/*
 * "Stop prompting AI, start onboarding it": AI relocates the work rather than removing it, so brief it like a
 * brand-new colleague on day one. Built from the Dossier under docs/episodes/onboard-ai-like-a-colleague-run-2/;
 * each Slide is one folder under `slides/`, named after its Dossier heading id. Upcoming until its video is live.
 */
export const onboardAiLikeAColleagueRun2 = episode({
  slug: 'onboard-ai-like-a-colleague-run-2',
  messages: { en, de },
  sections: [
    [thePromiseAndTheGap, twentyTimesOnPaper],
    [dayOneWithACapableStranger, aColleagueWhoKnowsTheWrittenWorld, thePlanIsDueByEndOfDay, whatWouldYouTellThemFirst],
    [youManagedItYouDidNotDoIt, youManagedTheTask, promptingLikeATool, confidentIsNotCorrect],
    [theEffortMovesItDoesNotVanish, theWorkRelocates, fromYourDeskToYourOrganization],
    [fourDisciplinesOneLineEach, fourWaysToOnboardAi, yourDayOneNoteBeforeYouType],
    [itFeelsLikeALot, theTwist],
  ],
});
