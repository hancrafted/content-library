import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextBarsPreset } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The opener of the Section "Thought experiment": the 82-minute call bar every opener shows, from the shared `call`
// Preset, one block a minute. No meaning colours, since no AI is in the call; only the primary light picks out what
// stays. The marker sits where this Section starts.
// Minute of the 82-minute call where this opener's "you are here" sits: its Section's start, by its share of the
// Episode's 16 Slides (hero 0, then Sections of 3, 5, 4 and 3 Slides: 5, 20, 46, 67).
const HERE_MINUTE = 5;

export const thoughtExperiment = slide({
  slug: 'thought-experiment',
  messages: { en, de },
  segments: [{ slug: 'a-long-chat-is-a-long-call' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <ContextBarsPreset preset="call" locale={locale} here={HERE_MINUTE} />
        <p className="text-caption">{t.rich('callLength')}</p>
        <p className="text-caption font-medium">{t('punchline')}</p>
      </div>
    </SlideFrame>
  ),
});
