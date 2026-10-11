import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// Basic page: title, caption, one block of prose.
export const basicPage = slide({
  slug: 'basic-page',
  messages: { en, de },
  notes: [{ slug: 'layout-target', target: 'prose' }],
  content: ({ t, Title }) => (
    <BasicPageSlide title={<Title>{t('title')}</Title>} caption={t('caption')} prose={t('prose')} />
  ),
});
