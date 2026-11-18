import { instanceOf } from '@/episodes/lib/episode-instance';
import { whatAgenticWorkflowsRequire as base } from '@/episodes/what-agentic-workflows-require/episode';
import aThoughtExperimentDe from './overrides/a-thought-experiment.de.json';
import contractsAtTheSeamsDe from './overrides/contracts-at-the-seams.de.json';
import designedAiFirstDe from './overrides/designed-ai-first.de.json';
import howFarYouStepOutDe from './overrides/how-far-you-step-out.de.json';
import inOnOrOutOfTheLoopDe from './overrides/in-on-or-out-of-the-loop.de.json';
import nowWithAgentsDe from './overrides/now-with-agents.de.json';
import planBackFromTheGoalDe from './overrides/plan-back-from-the-goal.de.json';
import reviewabilitySetsTheDistanceDe from './overrides/reviewability-sets-the-distance.de.json';
import reviewingTheResultDe from './overrides/reviewing-the-result.de.json';
import theOrgChartTrapDe from './overrides/the-org-chart-trap.de.json';
import theThoughtExperimentDe from './overrides/the-thought-experiment.de.json';
import whatAnAgentIsDe from './overrides/what-an-agent-is.de.json';
import whatAnAgenticWorkflowIsSlideDe from './overrides/what-an-agentic-workflow-is-slide.de.json';
import whatAnAgenticWorkflowIsDe from './overrides/what-an-agentic-workflow-is.de.json';
import whatItRequiresOfEachPersonDe from './overrides/what-it-requires-of-each-person.de.json';
import whatItRequiresOfTheOrganisationDe from './overrides/what-it-requires-of-the-organisation.de.json';
import whatToLookForInYourTeamDe from './overrides/what-to-look-for-in-your-team.de.json';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export const whatAgenticWorkflowsRequire = instanceOf(base, {
  slides: {
    'a-thought-experiment': { messages: { de: aThoughtExperimentDe } },
    'contracts-at-the-seams': { messages: { de: contractsAtTheSeamsDe } },
    'designed-ai-first': { messages: { de: designedAiFirstDe } },
    'how-far-you-step-out': { messages: { de: howFarYouStepOutDe } },
    'in-on-or-out-of-the-loop': { messages: { de: inOnOrOutOfTheLoopDe } },
    'now-with-agents': { messages: { de: nowWithAgentsDe } },
    'plan-back-from-the-goal': { messages: { de: planBackFromTheGoalDe } },
    'reviewability-sets-the-distance': { messages: { de: reviewabilitySetsTheDistanceDe } },
    'reviewing-the-result': { messages: { de: reviewingTheResultDe } },
    'the-org-chart-trap': { messages: { de: theOrgChartTrapDe } },
    'the-thought-experiment': { messages: { de: theThoughtExperimentDe } },
    'what-an-agent-is': { messages: { de: whatAnAgentIsDe } },
    'what-an-agentic-workflow-is': { messages: { de: whatAnAgenticWorkflowIsDe } },
    'what-an-agentic-workflow-is-slide': { messages: { de: whatAnAgenticWorkflowIsSlideDe } },
    'what-it-requires-of-each-person': { messages: { de: whatItRequiresOfEachPersonDe } },
    'what-it-requires-of-the-organisation': { messages: { de: whatItRequiresOfTheOrganisationDe } },
    'what-to-look-for-in-your-team': { messages: { de: whatToLookForInYourTeamDe } },
  },
});
