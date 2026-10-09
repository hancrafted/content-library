import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

function LostMiddleDiagram(): ReactElement {
  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-stretch gap-2 font-mono text-xs">
        <div className="flex-1 rounded border-l-4 border-primary bg-base-200 p-3">
          <span className="block font-bold text-primary">System prompt (Primacy)</span>
          &ldquo;You are an expert coder&hellip;&rdquo;
        </div>
        <div className="flex-1 rounded bg-base-200 p-3 opacity-40 blur-[1px]">[msg 12: read utils.js]</div>
        <div className="hidden md:block flex-1 rounded bg-base-200 p-3 opacity-40 blur-[1px]">
          [msg 13: modify api.js]
        </div>
        <div className="flex-1 rounded bg-base-200 p-3 opacity-40 blur-[1px]">[msg 14: read config.json]</div>
        <div className="flex-1 rounded border-l-4 border-accent bg-base-200 p-3">
          <span className="block font-bold text-accent">Latest request (Recency)</span>
          &ldquo;Why is the build failing?&rdquo;
        </div>
      </div>

      <div className="rounded-box border border-base-content/10 bg-base-200 p-4 text-sm">
        <span className="font-semibold text-primary">Serial-position effect:</span> Models recall the first and last
        exchanges sharply, while the middle blurs into an attention valley.
      </div>
    </div>
  );
}

export const theLostMiddle = slide({
  slug: 'the-lost-middle',
  minutes: { en: 2, de: 2 },
  notes: [{ slug: 'attention-valley', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <LostMiddleDiagram />
    </SlideFrame>
  ),
});
