import type { Episode, EpisodeSection } from '@/components/episode-page/episode-page-container.pure';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import type { SectionsT } from './context';
import { googleOkf, steeringTheAi, theVerifyingHalfIsYours } from './slides-steering';
import { markdownInAiWorkflows, volumeOutrunsReview, whereTheEffortGoes } from './slides-workflows';

function sections(t: SectionsT): EpisodeSection[] {
  return [
    markdownInAiWorkflows(t),
    volumeOutrunsReview(t),
    whereTheEffortGoes(t),
    googleOkf(t),
    steeringTheAi(t),
    theVerifyingHalfIsYours(t),
  ];
}

export const maintainingMarkdownForAi = {
  slug: 'maintaining-markdown-for-ai',
  youtube: { en: 'YxCVw4bUbW0', de: 'YxCVw4bUbW0' },
  async content(locale: Locale) {
    const t = await getTranslations({
      locale,
      namespace: 'episodes.maintaining-markdown-for-ai',
    });
    const sectionsT = await getTranslations({
      locale,
      namespace: 'episodes.maintaining-markdown-for-ai.sections',
    });
    return {
      title: t('title'),
      caption: t('caption'),
      sections: sections(sectionsT),
    };
  },
} satisfies Episode;
