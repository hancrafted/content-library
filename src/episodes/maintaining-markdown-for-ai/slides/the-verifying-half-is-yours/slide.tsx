import { SectionSlide } from '@/episodes/components/slide-master/section-slide';
import { slide } from '@/episodes/components/slide-master/slide';
import { SlideProse } from '@/episodes/components/slide-master/slide-master';
import { EffortVenn } from '@/episodes/components/slide-shared/effort-venn';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const theVerifyingHalfIsYours = slide({
  slug: 'the-verifying-half-is-yours',
  messages: { en, de },
  notes: [
    { slug: 'the-work-moved', target: 'title' },
    { slug: 'closing-thesis', target: 'conclusion-card' },
  ],
  segments: [{ slug: 'closing-thesis' }],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <EffortVenn emphasis="human" className="mt-4" />
      <div {...target('conclusion-card')} className="mt-6 flex flex-col items-center justify-center gap-2">
        <p className="font-mono text-base font-semibold text-ai">the AI region is my hypothesis — still unsettled</p>
        <p className="font-mono text-xs text-muted-foreground">
          markdown-harness · github.com/hancrafted/markdown-harness
        </p>
      </div>
    </SectionSlide>
  ),
});
