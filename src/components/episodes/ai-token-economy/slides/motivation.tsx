import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import { FreelancerCards } from '../freelancer-cards';

const slide = slidesFor('ai-token-economy');

export const motivation = slide({
  slug: 'motivation',
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
