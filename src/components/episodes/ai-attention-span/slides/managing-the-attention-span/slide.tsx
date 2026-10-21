import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { SessionBarPreset } from '@/components/slide-shared/context/context';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Managing the attention span": the session bar from the shared `session` plan, filled up to and including this
// Section, which it names.
export const managingTheAttentionSpan = slide({
  slug: 'managing-the-attention-span',
  messages: { en, de },
  segments: [{ slug: 'you-manage-by-habit' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SessionBarPreset locale={locale} at="managing-the-attention-span" />
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
