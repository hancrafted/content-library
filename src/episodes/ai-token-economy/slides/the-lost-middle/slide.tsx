import { slide } from '@/episodes/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/episodes/components/slide-master/slide-master';
import type { ReactElement } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

function LostMiddleDiagram(): ReactElement {
  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-stretch gap-2 font-mono text-xs">
        <div className="flex-1 rounded border-l-4 border-primary bg-muted p-3">
          <span className="block font-bold text-primary">System prompt (Primacy)</span>
          &ldquo;You are an expert coder&hellip;&rdquo;
        </div>
        <div className="flex-1 rounded bg-muted p-3 opacity-40 blur-[1px]">[msg 12: read utils.js]</div>
        <div className="hidden md:block flex-1 rounded bg-muted p-3 opacity-40 blur-[1px]">[msg 13: modify api.js]</div>
        <div className="flex-1 rounded bg-muted p-3 opacity-40 blur-[1px]">[msg 14: read config.json]</div>
        <div className="flex-1 rounded border-l-4 border-human bg-muted p-3">
          <span className="block font-bold text-human">Latest request (Recency)</span>
          &ldquo;Why is the build failing?&rdquo;
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted p-4 text-sm">
        <span className="font-semibold text-primary">Serial-position effect:</span> Models recall the first and last
        exchanges sharply, while the middle blurs into an attention valley.
      </div>
    </div>
  );
}

export const theLostMiddle = slide({
  slug: 'the-lost-middle',
  messages: { en, de },
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
