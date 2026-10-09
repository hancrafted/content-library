import { slidesFor } from '@/components/slide-master/episode-record';
import { ThreeColumnSlide } from '@/components/slide-master/three-column-slide';

const slide = slidesFor('page-template');

export const buildingBlocks = slide({
  slug: 'building-blocks',
  minutes: { en: 5, de: 6 },
  content: ({ t, Title }) => {
    const column = (slug: 'section' | 'basic' | 'three-column') => ({
      slug,
      title: t(`columns.${slug}.title`),
      prose: t(`columns.${slug}.prose`),
    });
    return (
      <ThreeColumnSlide
        title={<Title>{t('title')}</Title>}
        caption={t('caption')}
        columns={[column('section'), column('basic'), column('three-column')]}
      />
    );
  },
});
