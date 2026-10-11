import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import { ClaudeContextTerminalClient } from './claude-context-terminal.client';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const liveContextBreakdown = slide({
  slug: 'live-context-breakdown',
  messages: { en, de },
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
