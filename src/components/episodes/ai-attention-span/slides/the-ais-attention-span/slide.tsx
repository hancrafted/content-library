import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextBarsPreset, contextBarFigures } from '@/components/slide-shared/context/context';
import { shortTokens } from '@/components/slide-shared/context/context-format.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The AI's attention span": the call's bar becomes the 200K window under the same light, drawn
// from the shared `faded-middle` Preset, which also gives the figures the note says.
export const theAisAttentionSpan = slide({
  slug: 'the-ais-attention-span',
  messages: { en, de },
  segments: [{ slug: 'why-it-happens' }],
  content: ({ t, locale }) => {
    const figures = contextBarFigures({ preset: 'faded-middle', locale });
    const size = (tokens: number) => shortTokens(tokens, locale).toUpperCase();
    return (
      <SlideFrame>
        <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
          <ContextBarsPreset preset="faded-middle" locale={locale} />
          <p className="text-caption">
            {t.rich('windowNote', { used: size(figures.usedTokens), window: size(figures.windowTokens) })}
          </p>
        </div>
      </SlideFrame>
    );
  },
});
