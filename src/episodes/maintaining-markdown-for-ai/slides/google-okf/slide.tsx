import { SectionSlide } from '@/episodes/components/slide-master/section-slide';
import { slide } from '@/episodes/components/slide-master/slide';
import { SlideProse } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { OkfSchema } from './okf-schema';

export const googleOkf = slide({
  slug: 'google-okf',
  messages: { en, de },
  notes: [
    { slug: 'open-knowledge-format', target: 'title' },
    { slug: 'lifecycle-fields', target: 'schema-card' },
  ],
  segments: [{ slug: 'shared-vocabulary', bridge: true }],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <OkfSchema {...target('schema-card')} />
    </SectionSlide>
  ),
});
