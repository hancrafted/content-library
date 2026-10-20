import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextGrid, type GridRun } from '@/components/slide-shared/context-grid/context-grid';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The old chat at 64%, full of tool results. */
const OLD_CHAT: readonly GridRun[] = [
  { tone: 'instructions', count: 17 },
  { tone: 'memory', count: 1 },
  { tone: 'messages', count: 1 },
  { tone: 'tools', count: 45 },
  { tone: 'free', count: 28 },
  { tone: 'buffer', count: 8 },
];

/** A fresh chat at 19%: the starting instructions, memory and the handoff, ringed. */
const FRESH_CHAT: readonly GridRun[] = [
  { tone: 'instructions', count: 17 },
  { tone: 'memory', count: 1 },
  { tone: 'messages', count: 1, ring: 'point' },
  { tone: 'free', count: 73 },
  { tone: 'buffer', count: 8 },
];

// The section slide of "Managing the attention span": two small grids, the old chat faded and a nearly empty fresh
// one holding only the handoff, and the handoff card with the budget in its tint.
export const managingTheAttentionSpan = slide({
  slug: 'managing-the-attention-span',
  messages: { en, de },
  segments: [{ slug: 'you-manage-by-habit' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-sm flex-wrap items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-1 opacity-60">
          <ContextGrid runs={OLD_CHAT} size="sm" label={t('gridLabel')} />
          <span className="text-caption text-muted-foreground">{t('oldChat')}</span>
        </div>
        <div className="flex flex-col gap-1">
          <ContextGrid runs={FRESH_CHAT} size="sm" label={t('gridLabel')} />
          <span className="text-caption font-semibold">{t('freshChat')}</span>
        </div>
        <p className="w-full -rotate-1 rounded-lg border border-border bg-card p-2 text-caption shadow-md ring-2 ring-primary">
          {t.rich('handoff', {
            budget: (chunks: ReactNode) => (
              <span className="rounded bg-(--warning)/25 px-1 whitespace-nowrap">{chunks}</span>
            ),
          })}
        </p>
      </div>
    </SlideFrame>
  ),
});
