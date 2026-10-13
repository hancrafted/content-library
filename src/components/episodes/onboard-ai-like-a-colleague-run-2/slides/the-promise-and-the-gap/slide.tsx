import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The promise and the gap": the kit's section layout as is, no caption, no Visual, no motion.
export const thePromiseAndTheGap = slide({
  slug: 'the-promise-and-the-gap',
  messages: { en, de },
  segments: [{ slug: 'open-on-the-hype' }, { slug: 'bridge-to-the-room' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
