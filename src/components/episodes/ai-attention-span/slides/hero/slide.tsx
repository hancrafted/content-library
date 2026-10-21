import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/components/slide-master/slide-master';
import { ContextBarsPreset } from '@/components/slide-shared/context/context';
import { BarSwatch } from '@/components/slide-shared/context/context-bar-view';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`): the 82-minute call bar every Section opener shows, the start
 * and the end sharp, the middle faded and one detail standing out, with "you are here" at the start of the Episode,
 * the title being its first minute. The bar and its marker come from the shared `call` Preset. The shared header
 * renders the h1 and the caption above it. Pointing at a legend row dims the others. The empty Backdrop is the Title
 * slide's one Backdrop, holding no glow.
 */
// Minute of the 82-minute call where this opener's "you are here" sits: its Section's start, by its share of the
// Episode's 16 Slides (hero 0, then Sections of 3, 5, 4 and 3 Slides: 5, 20, 46, 67).
const HERE_MINUTE = 0;

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t, locale }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-md">
          <ContextBarsPreset preset="call" locale={locale} here={HERE_MINUTE} />
          <ul className="focus-group focus-group--dim-others flex flex-col gap-2 text-caption">
            <li className="focus-group__item flex items-center gap-2 font-semibold text-foreground" tabIndex={0}>
              <BarSwatch colour="--primary" />
              {t('litLabel')}
            </li>
            <li className="focus-group__item flex items-center gap-2 text-muted-foreground" tabIndex={0}>
              <BarSwatch colour="faded" />
              {t('fadedLabel')}
            </li>
          </ul>
        </div>
      </SlideFrame>
    </>
  ),
});
