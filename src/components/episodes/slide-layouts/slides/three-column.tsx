import { slidesFor } from '@/components/slide-master/episode-record';
import { ThreeColumnSlide } from '@/components/slide-master/three-column-slide';

const slide = slidesFor('slide-layouts');

// Three columns: each column's slug is its note target and its Translation key.
export const threeColumn = slide({
  slug: 'three-column',
  notes: [{ slug: 'column-target', target: 'second' }],
  content: ({ t, Title }) => {
    const column = (slug: 'first' | 'second' | 'third') => ({
      slug,
      title: t(`columns.${slug}.title`),
      prose: t(`columns.${slug}.prose`),
    });
    return (
      <ThreeColumnSlide
        title={<Title>{t('title')}</Title>}
        caption={t('caption')}
        columns={[column('first'), column('second'), column('third')]}
      />
    );
  },
});
