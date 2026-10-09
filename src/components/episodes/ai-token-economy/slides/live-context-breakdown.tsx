import { ClaudeContextTerminalClient } from '@/components/episodes/ai-token-economy/client/claude-context-terminal.client';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('ai-token-economy');

export const liveContextBreakdown = slide({
  slug: 'live-context-breakdown',
  notes: [{ slug: 'synthetic-abstractions', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <div className="mt-8">
        <ClaudeContextTerminalClient />
      </div>
    </SlideFrame>
  ),
});
