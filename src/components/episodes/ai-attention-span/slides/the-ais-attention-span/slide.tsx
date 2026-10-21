import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { SessionBarPreset } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The AI's attention span": the session bar from the shared `session` plan, filled up to and including this
// Section, which it names.
export const theAisAttentionSpan = slide({
  slug: 'the-ais-attention-span',
  messages: { en, de },
  segments: [{ slug: 'why-it-happens' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SessionBarPreset locale={locale} at="the-ais-attention-span" />
        <p data-below="" className="text-caption">
          {t('challenge')}
        </p>
      </div>
    </SlideFrame>
  ),
});
