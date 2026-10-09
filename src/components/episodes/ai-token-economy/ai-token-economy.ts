import { episode } from '@/components/slide-master/episode-record';
import { cliVsWebToolObscurity } from './slides/cli-vs-web-tool-obscurity';
import { costOfAgenticAi } from './slides/cost-of-agentic-ai';
import { leadOneUpskillMany } from './slides/lead-one-upskill-many';
import { liveContextBreakdown } from './slides/live-context-breakdown';
import { managingContext } from './slides/managing-context';
import { modelTiers } from './slides/model-tiers';
import { motivation } from './slides/motivation';
import { outcomePerEuro } from './slides/outcome-per-euro';
import { theCompoundingCostCurve } from './slides/the-compounding-cost-curve';
import { theFourErasOfAi } from './slides/the-four-eras-of-ai';
import { theFullnessGaugeAndLevers } from './slides/the-fullness-gauge-and-levers';
import { theInvisibleInvoice } from './slides/the-invisible-invoice';
import { theLostMiddle } from './slides/the-lost-middle';
import { toolsAndTips } from './slides/tools-and-tips';
import { whatIsAToken } from './slides/what-is-a-token';

export const aiTokenEconomy = episode({
  slug: 'ai-token-economy',
  youtube: { en: 'S0Nx4faEebY', de: 'S0Nx4faEebY' },
  sections: [
    [motivation, leadOneUpskillMany, theFourErasOfAi, theInvisibleInvoice, outcomePerEuro],
    [whatIsAToken, liveContextBreakdown, cliVsWebToolObscurity],
    [managingContext, theLostMiddle, theFullnessGaugeAndLevers],
    [costOfAgenticAi, theCompoundingCostCurve],
    [modelTiers],
    [toolsAndTips],
  ],
});
