import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A Section's first Slide is its section slide: the `title` in its own Translation files names the Section.
export const foundations = slide({
  slug: 'foundations',
  messages: { en, de },
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
