import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { SessionBarPreset } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "What fills the window": the session bar from the shared `session` plan, filled up to and including this
// Section, which it names.
export const whatFillsTheWindow = slide({
  slug: 'what-fills-the-window',
  messages: { en, de },
  segments: [{ slug: 'more-in-there-than-you-typed' }],
  content: ({ locale }) => (
    <SlideFrame>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SessionBarPreset locale={locale} at="what-fills-the-window" />
      </div>
    </SlideFrame>
  ),
});
