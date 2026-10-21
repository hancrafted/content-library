import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextBarsPreset } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The opener of the Section "Thought experiment": the call as the cornerstone's horizontal bar, one block a minute
// from the shared `call` Preset (82 minutes of segments), foreshadowing the window bar. No meaning colours, since no
// AI is in the call; only the primary light picks out what stays.
export const thoughtExperiment = slide({
  slug: 'thought-experiment',
  messages: { en, de },
  segments: [{ slug: 'a-long-chat-is-a-long-call' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <ContextBarsPreset preset="call" locale={locale} />
        <p className="text-caption">{t.rich('callLength')}</p>
        <p className="text-caption font-medium">{t('punchline')}</p>
      </div>
    </SlideFrame>
  ),
});
