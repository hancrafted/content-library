import { aiAttentionSpan } from '@/episodes/ai-attention-span/episode';
import { instanceOf } from '@/episodes/lib/episode-instance';
import de from './i18n/de.json';
import en from './i18n/en.json';
import managingTheAttentionSpanDe from './overrides/managing-the-attention-span.de.json';
import theAisAttentionSpanDe from './overrides/the-ais-attention-span.de.json';
import whatFillsTheWindowDe from './overrides/what-fills-the-window.de.json';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export const cyberforumExiDigitalAgenticWorkflowsAiAttentionSpan = instanceOf(aiAttentionSpan, {
  title: {
    notes: [{ slug: 'check-in', target: 'title' }],
    messages: { en, de },
  },
  slides: {
    'the-ais-attention-span': { messages: { de: theAisAttentionSpanDe } },
    'what-fills-the-window': { messages: { de: whatFillsTheWindowDe } },
    'managing-the-attention-span': {
      messages: { de: managingTheAttentionSpanDe },
    },
  },
});
