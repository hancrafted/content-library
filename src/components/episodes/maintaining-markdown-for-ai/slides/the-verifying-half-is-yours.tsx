import { EffortVenn } from '@/components/episodes/maintaining-markdown-for-ai/effort-venn';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const theVerifyingHalfIsYours = slide({
  slug: 'the-verifying-half-is-yours',
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
        <p className="font-mono text-base font-semibold text-accent">
          the AI region is my hypothesis — still unsettled
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          markdown-harness · github.com/hancrafted/markdown-harness
        </p>
      </div>
    </SectionSlide>
  ),
});
