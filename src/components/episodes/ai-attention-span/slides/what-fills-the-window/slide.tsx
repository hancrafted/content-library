import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextBarsPreset } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "What fills the window": the Episode's call bar from the shared `call` Preset, with the
// marker where this Section starts.
// Minute of the 82-minute call where this opener's "you are here" sits: its Section's start, by its share of the
// Episode's 16 Slides (hero 0, then Sections of 3, 5, 4 and 3 Slides: 5, 20, 46, 67).
const HERE_MINUTE = 46;

export const whatFillsTheWindow = slide({
  slug: 'what-fills-the-window',
  messages: { en, de },
  segments: [{ slug: 'more-in-there-than-you-typed' }],
  content: ({ locale }) => (
    <SlideFrame>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <ContextBarsPreset preset="call" locale={locale} here={HERE_MINUTE} />
      </div>
    </SlideFrame>
  ),
});
