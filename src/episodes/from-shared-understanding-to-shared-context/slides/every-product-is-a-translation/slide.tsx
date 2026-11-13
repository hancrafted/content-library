import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Dartboard } from '@/episodes/components/slide-shared/dartboard/dartboard';
import { Darts, type DartTone, type Point } from '@/episodes/components/slide-shared/dartboard/darts';
import { cn } from '@/shared/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';

type Outcome = 'both' | 'precise' | 'accurate' | 'neither';

/**
 * The four classic boards: where each cluster lands, relative to its board's centre, and how it is drawn. On the bull
 * is `ai` on a `card` edge, a tight cluster off target is `warning`, a loose one is dulled toward `muted-foreground`.
 */
const BOARDS: readonly { outcome: Outcome; cx: number; darts: readonly Point[]; tone: DartTone; edge?: boolean }[] = [
  {
    outcome: 'both',
    cx: 40,
    darts: [
      { x: -4, y: -4 },
      { x: 5, y: -2 },
      { x: -1, y: 5 },
    ],
    tone: 'ai',
    edge: true,
  },
  {
    outcome: 'precise',
    cx: 113,
    darts: [
      { x: 13, y: -16 },
      { x: 19, y: -13 },
      { x: 14, y: -9 },
    ],
    tone: 'warning',
  },
  {
    outcome: 'accurate',
    cx: 187,
    darts: [
      { x: -17, y: -6 },
      { x: 16, y: -10 },
      { x: 3, y: 18 },
    ],
    tone: 'dulled',
  },
  {
    outcome: 'neither',
    cx: 260,
    darts: [
      { x: -20, y: -18 },
      { x: 16, y: 16 },
      { x: -12, y: 20 },
    ],
    tone: 'warning',
  },
];
const CY = 62;

// The section slide of "Every product is a translation", echoing the Hero motif: the four classic dartboards,
// precise and accurate, precise only, accurate only, neither. Slide 6 defines both words; this board only names them.
export const everyProductIsATranslation = slide({
  slug: 'every-product-is-a-translation',
  messages: { en, de },
  presentation: {
    tone: 'inverse',
    style: {
      '--slide-surface': 'color-mix(in oklab, var(--tone-paper) 88%, var(--tone-ink))',
      '--slide-space-after': '265px',
    },
    enter: { effect: 'liquid' },
    leave: { effect: 'liquid' },
  },
  segments: [{ slug: 'a-new-pain' }, { slug: 'where-the-section-goes' }],
  content: ({ t }) => (
    <SlideFrame>
      {/* On the inverse surface the board flips back to the page's own tone, on a card, so every dart keeps its contrast. */}
      <div data-tone-flip className="max-w-xl rounded-xl bg-card p-6">
        <svg viewBox="0 20 300 104" className="w-full" role="img" aria-label={t('label')}>
          {BOARDS.map(({ outcome, cx, darts, tone, edge }) => (
            <g key={outcome}>
              <Dartboard cx={cx} cy={CY} r={30} rings={2} bull={6} tone="hero" />
              <Darts points={darts.map(({ x, y }) => ({ x: cx + x, y: CY + y }))} tone={tone} edge={edge} r={3.5} />
              <text
                data-board-label
                x={cx}
                y={114}
                textAnchor="middle"
                className={cn(
                  'text-caption',
                  outcome === 'both' ? 'fill-primary font-semibold' : 'fill-muted-foreground',
                )}
              >
                {t(outcome)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </SlideFrame>
  ),
});
