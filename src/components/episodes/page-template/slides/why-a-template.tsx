import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slidesFor } from '@/components/slide-master/episode-record';

const slide = slidesFor('page-template');

/** The one Slide with notes and a Voice script: shows the pattern, and leaves the empty state to the rest. */
export const whyATemplate = slide({
  slug: 'why-a-template',
  minutes: { en: 3, de: 4 },
  notes: [{ slug: 'reference-episode', target: 'prose' }],
  segments: [{ slug: 'one-breath', from: 0, to: 1 }],
  content: ({ t, Title }) => (
    <BasicPageSlide title={<Title>{t('title')}</Title>} caption={t('caption')} prose={t('prose')} />
  ),
});
