import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Dartboard } from '@/episodes/components/slide-shared/dartboard/dartboard';
import { Darts, type Point } from '@/episodes/components/slide-shared/dartboard/darts';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** Ten times the throws, scattered off the bull. */
const SCATTER: readonly Point[] = [
  { x: 160, y: 40 },
  { x: 238, y: 50 },
  { x: 250, y: 110 },
  { x: 172, y: 120 },
  { x: 224, y: 88 },
  { x: 146, y: 84 },
  { x: 212, y: 28 },
];

// The section slide of "A thought experiment", echoing the Hero motif: the AI badge throws ten times as many darts,
// and they scatter off the bull in `warning`. Its Voice script opens the Episode, since the Title slide has none.
export const aThoughtExperiment = slide({
  slug: 'a-thought-experiment',
  messages: { en, de },
  segments: [{ slug: 'imagine-your-organization-as-a-line' }, { slug: 'where-this-is-going' }],
  content: ({ t }) => (
    <SlideFrame>
      <svg viewBox="0 0 300 150" className="w-full max-w-xl" role="img" aria-label={t('label')}>
        <Dartboard cx={200} cy={78} r={66} rings={3} bull={8} />
        <Darts points={SCATTER} tone="warning" r={5} />
        <circle cx={44} cy={78} r={14} className="fill-ai" />
        <text x={44} y={83} textAnchor="middle" className="fill-card text-caption font-semibold">
          {t('ai')}
        </text>
        <path d="M66 66 h44 M66 78 h56 M66 90 h44" className="stroke-ai" strokeWidth={2} strokeLinecap="round" />
        <text x={60} y={140} textAnchor="middle" className="fill-(--warning) text-caption font-semibold">
          {t('moreThrows')}
        </text>
      </svg>
    </SlideFrame>
  ),
});
