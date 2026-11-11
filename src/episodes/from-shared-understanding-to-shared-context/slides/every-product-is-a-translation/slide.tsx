import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Dartboard } from '@/episodes/components/slide-shared/dartboard/dartboard';
import { cn } from '@/shared/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';

type Outcome = 'both' | 'precise' | 'accurate' | 'neither';

/**
 * The four classic boards: where each cluster lands, relative to its board's centre, and how it is drawn. On the bull
 * is `ai`, a tight cluster off target is `warning`, a loose one is dulled toward `muted-foreground`.
 */
const BOARDS: readonly { outcome: Outcome; cx: number; darts: readonly (readonly [number, number])[]; dart: string }[] =
  [
    {
      outcome: 'both',
      cx: 40,
      darts: [
        [-4, -4],
        [5, -2],
        [-1, 5],
      ],
      dart: 'fill-ai stroke-card',
    },
    {
      outcome: 'precise',
      cx: 113,
      darts: [
        [13, -16],
        [19, -13],
        [14, -9],
      ],
      dart: 'fill-(--warning)',
    },
    {
      outcome: 'accurate',
      cx: 187,
      darts: [
        [-17, -6],
        [16, -10],
        [3, 18],
      ],
      dart: 'fill-muted-foreground',
    },
    {
      outcome: 'neither',
      cx: 260,
      darts: [
        [-20, -18],
        [16, 16],
        [-12, 20],
      ],
      dart: 'fill-(--warning)',
    },
  ];
const CY = 62;

// The section slide of "Every product is a translation", echoing the Hero motif: the four classic dartboards,
// precise and accurate, precise only, accurate only, neither. Slide 6 defines both words; this board only names them.
export const everyProductIsATranslation = slide({
  slug: 'every-product-is-a-translation',
  messages: { en, de },
  segments: [{ slug: 'a-new-pain' }, { slug: 'where-the-section-goes' }],
  content: ({ t }) => (
    <SlideFrame>
      <svg viewBox="0 20 300 104" className="w-full max-w-xl" role="img" aria-label={t('label')}>
        {BOARDS.map(({ outcome, cx, darts, dart }) => (
          <g key={outcome}>
            <Dartboard cx={cx} cy={CY} r={30} rings={2} bull={6} tone="hero" />
            {darts.map(([dx, dy]) => (
              <circle key={`${dx}-${dy}`} data-dart cx={cx + dx} cy={CY + dy} r={3.5} className={dart} />
            ))}
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
    </SlideFrame>
  ),
});
