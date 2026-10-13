import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The Episode's last Slide, on the basic-page master: one line as the title,
 * and under it a small, quiet pointer to the grill-me approach. Nothing is
 * promised for the next Episode. Built without motion (Han's decision for
 * this Episode).
 */
export const aiCanHelpYouOnboardAi = slide({
  slug: 'ai-can-help-you-onboard-ai',
  messages: { en, de },
  notes: [
    {
      slug: 'why-the-effort-pays-back',
      target: 'title',
      sources: [
        {
          slug: 'economic-index-learning-curves',
          url: 'https://www.anthropic.com/research/economic-index-march-2026-report',
        },
      ],
    },
  ],
  segments: [{ slug: 'it-feels-like-a-lot' }, { slug: 'the-twist' }, { slug: 'grill-me-lightly' }],
  content: ({ t, Title }) => (
    <BasicPageSlide title={<Title>{t('title')}</Title>} caption={t('caption')} prose={t('prose')} />
  ),
});
