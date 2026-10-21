import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/components/slide-master/slide-master';
import { ContextBarsPreset, contextBarFigures } from '@/components/slide-shared/context/context';
import { BarSwatch } from '@/components/slide-shared/context/context-bar-view';
import { shortTokens } from '@/components/slide-shared/context/context-format.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif: the summer-party chat as the cornerstone's
 * horizontal bar, the start and the newest in colour and the middle faded. The bar, its figure and the buffer come
 * from the shared `faded-middle` Preset, so no number is written here. The shared header renders the h1 and the
 * caption above it. Pointing at a legend row dims the others. The empty Backdrop is the Title slide's one Backdrop,
 * holding no glow.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t, locale }) => {
    const figures = contextBarFigures({ preset: 'faded-middle', locale });
    const buffer = shortTokens(figures.bufferTokens, locale).toUpperCase();
    return (
      <>
        <SlideBackdrop mobile />
        <SlideFrame className="mt-10">
          <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-md">
            <ContextBarsPreset preset="faded-middle" locale={locale} />
            <ul className="focus-group focus-group--dim-others flex flex-col gap-2 text-caption">
              <li className="focus-group__item flex items-center gap-2 font-semibold text-foreground" tabIndex={0}>
                <BarSwatch colour="--cs-s-start" />
                {t('litLabel')}
              </li>
              <li className="focus-group__item flex items-center gap-2 text-muted-foreground" tabIndex={0}>
                <BarSwatch colour="faded" />
                {t('fadedLabel')}
              </li>
              <li className="focus-group__item flex items-center gap-2 text-muted-foreground" tabIndex={0}>
                <BarSwatch colour="buffer" />
                {t('bufferLabel', { tokens: buffer })}
              </li>
              <li className="text-muted-foreground">{t('illustrative')}</li>
            </ul>
          </div>
        </SlideFrame>
      </>
    );
  },
});
