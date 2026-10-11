import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import { EffortVenn } from '@/components/slide-shared/effort-venn';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whereTheEffortGoes = slide({
  slug: 'where-the-effort-goes',
  messages: { en, de },
  notes: [
    { slug: 'three-boundaries', target: 'title' },
    { slug: 'division-of-labour', target: 'venn' },
  ],
  segments: [{ slug: 'three-boundaries', bridge: true }],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <EffortVenn {...target('venn')} emphasis="establish" className="mt-4" />
    </SectionSlide>
  ),
});
