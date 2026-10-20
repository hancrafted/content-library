import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/components/slide-master/slide-master';
import { ContextGrid, GridSwatch, type GridRun } from '@/components/slide-shared/context-grid/context-grid';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The summer-party chat at 64% of a 200K window, one box per 2K: the start and the newest lit, the middle faded. */
const WINDOW: readonly GridRun[] = [
  { tone: 'instructions', count: 17 },
  { tone: 'memory', count: 1 },
  { tone: 'messages', count: 1 },
  { tone: 'faded', count: 43 },
  { tone: 'tools', count: 2 },
  { tone: 'free', count: 28 },
  { tone: 'buffer', count: 8 },
];

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif: the /context grid of the summer-party chat, a
 * hundred boxes with the start and the newest in colour and the middle faded. The shared header renders the h1 and
 * the caption above it. Pointing at a legend row dims the others. Each section slide echoes the grid. The empty
 * Backdrop is the Title slide's one Backdrop, holding no glow.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <div className="flex max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-md">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-body font-semibold">{t('gridTitle')}</p>
            <p className="text-caption text-muted-foreground">{t('usedLabel')}</p>
          </div>
          <ContextGrid runs={WINDOW} size="lg" label={t('gridLabel')} />
          <ul className="focus-group focus-group--dim-others flex flex-col gap-2 text-caption">
            <li className="focus-group__item flex items-center gap-2 font-semibold text-foreground" tabIndex={0}>
              <GridSwatch tone="instructions" />
              {t('litLabel')}
            </li>
            <li className="focus-group__item flex items-center gap-2 text-muted-foreground" tabIndex={0}>
              <GridSwatch tone="faded" />
              {t('fadedLabel')}
            </li>
            <li className="focus-group__item flex items-center gap-2 text-muted-foreground" tabIndex={0}>
              <GridSwatch tone="buffer" />
              {t('bufferLabel')}
            </li>
            <li className="text-muted-foreground">{t('boxScale')}</li>
          </ul>
        </div>
      </SlideFrame>
    </>
  ),
});
