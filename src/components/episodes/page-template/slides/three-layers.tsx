import { slidesFor } from '@/components/slide-master/episode-record';
import { ThreeColumnSlide } from '@/components/slide-master/three-column-slide';

const slide = slidesFor('page-template');

export const threeLayers = slide({
  slug: 'three-layers',
  minutes: { en: 4, de: 5 },
  content: ({ t, Title }) => {
    const column = (slug: 'master' | 'layouts' | 'catalog') => ({
      slug,
      title: t(`columns.${slug}.title`),
      prose: t(`columns.${slug}.prose`),
    });
    return (
      <ThreeColumnSlide
        title={<Title>{t('title')}</Title>}
        caption={t('caption')}
        columns={[column('master'), column('layouts'), column('catalog')]}
      />
    );
  },
});
