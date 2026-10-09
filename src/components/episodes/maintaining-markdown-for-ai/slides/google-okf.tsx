import { OkfSchema } from '@/components/episodes/maintaining-markdown-for-ai/okf-schema';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const googleOkf = slide({
  slug: 'google-okf',
  minutes: { en: 2, de: 2 },
  notes: [
    { slug: 'open-knowledge-format', target: 'title' },
    { slug: 'lifecycle-fields', target: 'schema-card' },
  ],
  segments: [{ slug: 'shared-vocabulary', from: 0.0, to: 1.08, bridge: true }],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <OkfSchema {...target('schema-card')} />
    </SectionSlide>
  ),
});
