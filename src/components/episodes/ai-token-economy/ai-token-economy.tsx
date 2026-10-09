import type { Episode, EpisodeSection } from '@/components/episode-page/episode-page-container.pure';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import type { SectionsT } from './context';
import {
  costOfAgenticAi,
  managingContext,
  modelTiers,
  motivation,
  theCompoundingCostCurve,
  theFullnessGaugeAndLevers,
  theLostMiddle,
  toolsAndTips,
  whatIsAToken,
} from './slides-content';
import { leadOneUpskillMany, outcomePerEuro, theFourErasOfAi, theInvisibleInvoice } from './slides-motivation';
import { cliVsWebToolObscurity, liveContextBreakdown } from './slides-tokens';

function sections(t: SectionsT): EpisodeSection[] {
  return [
    motivation(t, [leadOneUpskillMany(t), theFourErasOfAi(t), theInvisibleInvoice(t), outcomePerEuro(t)]),
    whatIsAToken(t, [liveContextBreakdown(t), cliVsWebToolObscurity(t)]),
    managingContext(t, [theLostMiddle(t), theFullnessGaugeAndLevers(t)]),
    costOfAgenticAi(t, [theCompoundingCostCurve(t)]),
    modelTiers(t),
    toolsAndTips(t),
  ];
}

export const aiTokenEconomy = {
  slug: 'ai-token-economy',
  youtube: { en: 'S0Nx4faEebY', de: 'S0Nx4faEebY' },
  async content(locale: Locale) {
    const t = await getTranslations({
      locale,
      namespace: 'episodes.ai-token-economy',
    });
    const sectionsT = await getTranslations({
      locale,
      namespace: 'episodes.ai-token-economy.sections',
    });
    return {
      title: t('title'),
      caption: t('caption'),
      sections: sections(sectionsT),
    };
  },
} satisfies Episode;
