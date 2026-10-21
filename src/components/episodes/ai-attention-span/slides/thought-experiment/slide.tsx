import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextGrid, type GridRun } from '@/components/slide-shared/context-grid/context-grid';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The call as 82 boxes, one a minute: the start, the end and Pepper's cake (minute 42) lit, the rest dimmed. */
const CALL: readonly GridRun[] = [
  { tone: 'lit', count: 4 },
  { tone: 'dim', count: 37 },
  { tone: 'lit', count: 1, ring: 'point' },
  { tone: 'dim', count: 36 },
  { tone: 'lit', count: 4 },
];

// The section slide of the Section "Thought experiment": the Hero motif's grid as the call, one box a minute. No meaning colours,
// since no AI is in the call; only the primary light picks out what stays.
export const thoughtExperiment = slide({
  slug: 'thought-experiment',
  messages: { en, de },
  segments: [{ slug: 'a-long-chat-is-a-long-call' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-sm flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <ContextGrid runs={CALL} size="md" label={t('gridLabel')} />
        <p className="text-caption">{t.rich('callLength')}</p>
        <p className="text-caption font-medium">{t('punchline')}</p>
      </div>
    </SlideFrame>
  ),
});
