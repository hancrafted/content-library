import { slide } from '@/components/slide-master/slide';
import { ThreeColumnSlide } from '@/components/slide-master/three-column-slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// Three columns: each column's slug is its note target and its Translation key.
export const threeColumn = slide({
  slug: 'three-column',
  messages: { en, de },
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
