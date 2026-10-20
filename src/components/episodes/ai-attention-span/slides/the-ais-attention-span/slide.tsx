import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextGrid, type GridRun } from '@/components/slide-shared/context-grid/context-grid';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The summer-party chat at 64% of a 200K window, one box per 2K, in its category tints, the middle faded. */
const WINDOW: readonly GridRun[] = [
  { tone: 'instructions', count: 17 },
  { tone: 'memory', count: 1 },
  { tone: 'messages', count: 1 },
  { tone: 'faded', count: 43 },
  { tone: 'tools', count: 2 },
  { tone: 'free', count: 28 },
  { tone: 'buffer', count: 8 },
];

// The section slide of "The AI's attention span": the call's grid becomes the 200K window under the same light.
export const theAisAttentionSpan = slide({
  slug: 'the-ais-attention-span',
  messages: { en, de },
  segments: [{ slug: 'why-it-happens' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-sm flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <ContextGrid runs={WINDOW} size="md" label={t('gridLabel')} />
        <p className="text-caption">{t.rich('windowNote')}</p>
      </div>
    </SlideFrame>
  ),
});
