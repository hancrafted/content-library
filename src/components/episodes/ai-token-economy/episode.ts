import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { cliVsWebToolObscurity } from './slides/cli-vs-web-tool-obscurity/slide';
import { costOfAgenticAi } from './slides/cost-of-agentic-ai/slide';
import { leadOneUpskillMany } from './slides/lead-one-upskill-many/slide';
import { liveContextBreakdown } from './slides/live-context-breakdown/slide';
import { managingContext } from './slides/managing-context/slide';
import { modelTiers } from './slides/model-tiers/slide';
import { motivation } from './slides/motivation/slide';
import { outcomePerEuro } from './slides/outcome-per-euro/slide';
import { theCompoundingCostCurve } from './slides/the-compounding-cost-curve/slide';
import { theFourErasOfAi } from './slides/the-four-eras-of-ai/slide';
import { theFullnessGaugeAndLevers } from './slides/the-fullness-gauge-and-levers/slide';
import { theInvisibleInvoice } from './slides/the-invisible-invoice/slide';
import { theLostMiddle } from './slides/the-lost-middle/slide';
import { toolsAndTips } from './slides/tools-and-tips/slide';
import { whatIsAToken } from './slides/what-is-a-token/slide';

export const aiTokenEconomy = episode({
  slug: 'ai-token-economy',
  messages: { en, de },
  header: 'authored',
  sections: [
    [motivation, leadOneUpskillMany, theFourErasOfAi, theInvisibleInvoice, outcomePerEuro],
    [whatIsAToken, liveContextBreakdown, cliVsWebToolObscurity],
    [managingContext, theLostMiddle, theFullnessGaugeAndLevers],
    [costOfAgenticAi, theCompoundingCostCurve],
    [modelTiers],
    [toolsAndTips],
  ],
});
