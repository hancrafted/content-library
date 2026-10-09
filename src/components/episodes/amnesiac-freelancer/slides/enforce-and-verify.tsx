import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slidesFor } from '@/components/slide-master/episode-record';

const slide = slidesFor('amnesiac-freelancer');

const BEST_PRACTICES = { slug: 'claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' };

export const enforceAndVerify = slide({
  slug: 'enforce-and-verify',
  minutes: { en: 3, de: 4 },
  notes: [
    { slug: 'verification-you-can-run', target: 'prose', sources: [BEST_PRACTICES] },
    { slug: 'a-different-grader', target: 'caption', sources: [BEST_PRACTICES] },
    { slug: 'independent-of-prose', target: 'prose' },
    { slug: 'close', target: 'title' },
  ],
  segments: [
    { slug: 'prove-it', from: 0.0, to: 1.0 },
    { slug: 'another-pair-of-eyes', from: 1.0, to: 2.0 },
    { slug: 'wrap-up', from: 2.0, to: 3.0, bridge: true },
  ],
  content: ({ t, Title }) => (
    <BasicPageSlide title={<Title>{t('title')}</Title>} caption={t('caption')} prose={t('prose')} />
  ),
});
