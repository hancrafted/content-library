import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Dartboard } from '@/episodes/components/slide-shared/dartboard/dartboard';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** Ten times the throws, scattered off the bull. */
const SCATTER = [
  [160, 40],
  [238, 50],
  [250, 110],
  [172, 120],
  [224, 88],
  [146, 84],
  [212, 28],
] as const;

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
        {SCATTER.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} data-dart cx={cx} cy={cy} r={5} className="fill-(--warning)" />
        ))}
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
