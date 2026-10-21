import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextBarsPreset, contextBarFigures } from '@/components/slide-shared/context/context';
import { BarSwatch } from '@/components/slide-shared/context/context-bar-view';
import { shortTokens } from '@/components/slide-shared/context/context-format.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "What fills the window": the Hero motif's bar, coloured by what you never typed. The shared
// `typed-and-read` Preset draws it and gives the figures the legend says.
export const whatFillsTheWindow = slide({
  slug: 'what-fills-the-window',
  messages: { en, de },
  segments: [{ slug: 'more-in-there-than-you-typed' }],
  content: ({ t, locale }) => {
    const figures = contextBarFigures({ preset: 'typed-and-read', locale });
    const size = (tokens: number | undefined) => shortTokens(tokens ?? 0, locale).toUpperCase();
    return (
      <SlideFrame>
        <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
          <ContextBarsPreset preset="typed-and-read" locale={locale} />
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-caption">
            <li className="flex items-center gap-1">
              <BarSwatch colour="--cs-s-start" />
              {t('legend.instructions', { tokens: size(figures.bySimple.start) })}
            </li>
            <li className="flex items-center gap-1">
              <BarSwatch colour="--cs-s-you" />
              {t('legend.typed')}
            </li>
            <li className="flex items-center gap-1 font-semibold">
              <BarSwatch colour="--cs-s-read" />
              {t('legend.pdf', { tokens: size(figures.byKey['m11@tool_result']) })}
            </li>
            <li className="text-muted-foreground">{t('legend.illustrative')}</li>
          </ul>
        </div>
      </SlideFrame>
    );
  },
});
