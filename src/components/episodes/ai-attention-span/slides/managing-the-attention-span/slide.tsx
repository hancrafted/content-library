import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextBarsPreset } from '@/components/slide-shared/context/context';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Managing the attention span": two bars from the shared `managing` Preset, the old chat full of
// tool results and a nearly empty fresh one holding only the handoff (ringed), and the handoff card with the budget
// in its tint.
export const managingTheAttentionSpan = slide({
  slug: 'managing-the-attention-span',
  messages: { en, de },
  segments: [{ slug: 'you-manage-by-habit' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <ContextBarsPreset preset="managing" locale={locale} />
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
