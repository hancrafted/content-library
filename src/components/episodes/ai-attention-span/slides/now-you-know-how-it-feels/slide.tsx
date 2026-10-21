import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { SessionBarPreset } from '@/components/slide-shared/context/context';
import { SESSION_END } from '@/components/slide-shared/context/context-bars.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The closing Slide, last of the last Section: the session bar from the shared `session` plan, full, since the viewer
// has now held as much as an AI does. The shared header carries the congratulation as the caption.
export const nowYouKnowHowItFeels = slide({
  slug: 'now-you-know-how-it-feels',
  messages: { en, de },
  segments: [{ slug: 'you-held-it-all' }],
  content: ({ locale }) => (
    <SlideFrame>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SessionBarPreset locale={locale} at={SESSION_END} />
      </div>
    </SlideFrame>
  ),
});
