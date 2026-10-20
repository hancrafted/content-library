import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextGrid, GridSwatch, type GridRun } from '@/components/slide-shared/context-grid/context-grid';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The same window with only what you never typed in colour: the starting instructions, memory, and the PDF ringed. */
const WINDOW: readonly GridRun[] = [
  { tone: 'instructions', count: 17 },
  { tone: 'memory', count: 1 },
  { tone: 'messages', count: 1 },
  { tone: 'faded', count: 8 },
  { tone: 'tools', count: 27, ring: 'span' },
  { tone: 'faded', count: 10 },
  { tone: 'free', count: 28 },
  { tone: 'buffer', count: 8 },
];

// The section slide of "What fills the window": the Hero motif's grid, coloured by what you never typed.
export const whatFillsTheWindow = slide({
  slug: 'what-fills-the-window',
  messages: { en, de },
  segments: [{ slug: 'more-in-there-than-you-typed' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-sm flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <ContextGrid runs={WINDOW} size="md" label={t('gridLabel')} />
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-caption">
          <li className="flex items-center gap-1">
            <GridSwatch tone="instructions" />
            {t('legend.instructions')}
          </li>
          <li className="flex items-center gap-1">
            <GridSwatch tone="messages" />
            {t('legend.typed')}
          </li>
          <li className="flex items-center gap-1 font-semibold">
            <GridSwatch tone="tools" />
            {t('legend.pdf')}
          </li>
          <li className="text-muted-foreground">{t('legend.illustrative')}</li>
        </ul>
      </div>
    </SlideFrame>
  ),
});
