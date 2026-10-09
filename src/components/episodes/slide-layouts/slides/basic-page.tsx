import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slidesFor } from '@/components/slide-master/episode-record';

const slide = slidesFor('slide-layouts');

// Basic page: title, caption, one block of prose.
export const basicPage = slide({
  slug: 'basic-page',
  notes: [{ slug: 'layout-target', target: 'prose' }],
  content: ({ t, Title }) => (
    <BasicPageSlide title={<Title>{t('title')}</Title>} caption={t('caption')} prose={t('prose')} />
  ),
});
