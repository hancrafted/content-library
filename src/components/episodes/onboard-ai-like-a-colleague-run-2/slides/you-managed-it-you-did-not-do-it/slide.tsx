import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "You managed it, you did not do it": the kit's section layout as is, no caption, no Visual, no motion.
export const youManagedItYouDidNotDoIt = slide({
  slug: 'you-managed-it-you-did-not-do-it',
  messages: { en, de },
  segments: [{ slug: 'pause-on-the-shift' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
