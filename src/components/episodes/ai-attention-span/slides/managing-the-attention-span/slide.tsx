import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextBarsPreset } from '@/components/slide-shared/context/context';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Managing the attention span": the Episode's call bar from the shared `call` Preset, with the
// marker where this Section starts, and the handoff card with the budget in its tint.
// Minute of the 82-minute call where this opener's "you are here" sits: its Section's start, by its share of the
// Episode's 16 Slides (hero 0, then Sections of 3, 5, 4 and 3 Slides: 5, 20, 46, 67).
const HERE_MINUTE = 67;

export const managingTheAttentionSpan = slide({
  slug: 'managing-the-attention-span',
  messages: { en, de },
  segments: [{ slug: 'you-manage-by-habit' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <ContextBarsPreset preset="call" locale={locale} here={HERE_MINUTE} />
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
