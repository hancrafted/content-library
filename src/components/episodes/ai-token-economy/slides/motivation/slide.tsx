import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import { FreelancerCards } from './freelancer-cards';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const motivation = slide({
  slug: 'motivation',
  messages: { en, de },
  notes: [
    { slug: 'freelancer-metaphor', target: 'title' },
    { slug: 'management-opt-in', target: 'freelancer-cards' },
  ],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <FreelancerCards {...target('freelancer-cards')} />
    </SectionSlide>
  ),
});
