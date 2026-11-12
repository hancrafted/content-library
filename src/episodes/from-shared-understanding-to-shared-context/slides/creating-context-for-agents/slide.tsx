import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Dartboard } from '@/episodes/components/slide-shared/dartboard/dartboard';
import { Darts, type DartTone, type Point } from '@/episodes/components/slide-shared/dartboard/darts';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** Each interview round's cluster, closing on the bull: loose and dulled, then `ai`, then on target. */
const ROUNDS: readonly { round: string; tone: DartTone; r: number; darts: readonly Point[] }[] = [
  {
    round: 'round1',
    tone: 'dulled',
    r: 4,
    darts: [
      { x: 140, y: 30 },
      { x: 150, y: 24 },
      { x: 134, y: 40 },
    ],
  },
  {
    round: 'round2',
    tone: 'ai',
    r: 4,
    darts: [
      { x: 166, y: 54 },
      { x: 172, y: 48 },
      { x: 162, y: 60 },
    ],
  },
  {
    round: 'round3',
    tone: 'foreground',
    r: 3.5,
    darts: [
      { x: 186, y: 74 },
      { x: 193, y: 72 },
      { x: 190, y: 80 },
    ],
  },
];

// The section slide of "Creating context for agents", echoing the Hero motif: each interview round moves the cluster
// closer to the bull, and the last one becomes the spec.
export const creatingContextForAgents = slide({
  slug: 'creating-context-for-agents',
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
  segments: [{ slug: 'the-pain' }, { slug: 'the-claim' }],
  content: ({ t }) => (
    <SlideFrame>
      {/* On the inverse surface the board flips back to the page's own tone, on a card, so every dart keeps its contrast. */}
      <div data-tone-flip className="max-w-xl rounded-xl bg-card p-6">
        <svg viewBox="0 0 300 150" className="w-full" role="img" aria-label={t('label')}>
          <Dartboard cx={190} cy={76} r={66} rings={3} bull={8} />
          {ROUNDS.map(({ round, tone, r, darts }) => (
            <Darts key={round} points={darts} tone={tone} r={r} />
          ))}
          <path
            d="M146 38 Q156 46 160 52 M172 62 Q180 68 182 70"
            className="fill-none stroke-primary"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          <text x={10} y={34} className="fill-muted-foreground text-caption">
            {t('round1')}
          </text>
          <text x={10} y={62} className="fill-ai text-caption font-medium">
            {t('round2')}
          </text>
          <text x={10} y={90} className="fill-primary text-caption font-semibold">
            {t('round3')}
          </text>
          <text x={10} y={130} className="fill-primary text-caption font-semibold">
            {t('spec')}
          </text>
        </svg>
      </div>
    </SlideFrame>
  ),
});
