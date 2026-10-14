import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

/* The third Section's own slide: its Dossier h2 alone, centred, since the Dossier names no caption. */
export const howToStartSales = slide({
  slug: 'how-to-start-sales',
  messages: { en, de },
  segments: [{ slug: 'make-the-first-moves-concrete' }, { slug: 'keep-the-method-small' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
