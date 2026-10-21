import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ThreadPair, type Band, type BandCopy } from './thread-pair';

const LIU = { slug: 'liu-lost-in-the-middle', url: 'https://arxiv.org/abs/2307.03172' };

/** The Speaker note each band's pill opens; the standout pill has none. */
const BAND_NOTES = {
  start: 'a-built-in-pull-to-the-start',
  middle: 'measured-even-for-long-input-models',
  standout: null,
  end: 'two-position-effects',
} as const satisfies Record<Band, string | null>;

/** The pill's Context marker on its dark pill. */
const ON_PILL = 'text-background/70 hover:text-foreground focus-visible:text-foreground';

/** A budget figure in the Episode's one budget tint; the total and the budget itself in semibold. */
const cost = (chunks: ReactNode) => (
  <span className="rounded-sm bg-(--warning)/25 px-1 whitespace-nowrap">{chunks}</span>
);
const budget = (chunks: ReactNode) => (
  <span className="rounded-md bg-(--warning)/25 px-1 font-semibold whitespace-nowrap">{chunks}</span>
);
const muted = (chunks: ReactNode) => <span className="text-muted-foreground">{chunks}</span>;

/*
 * "AI forgets the middle too" (Spec Option 2a): the sister thread and the summer-party chat side by side on
 * `SlideFrame`, aligned on four bands, so the same lighting lands on both. The Slide header above shows the title
 * and caption. The start, middle and end pills open their Speaker notes; the footnote opens "Planted facts, not chat
 * products" and "The strength varies". The context window is not named here.
 */
export const aiForgetsTheMiddleToo = slide({
  slug: 'ai-forgets-the-middle-too',
  messages: { en, de },
  notes: [
    { slug: 'measured-even-for-long-input-models', target: 'middle', sources: [LIU] },
    {
      slug: 'a-built-in-pull-to-the-start',
      target: 'start',
      sources: [{ slug: 'xiao-attention-sinks', url: 'https://arxiv.org/abs/2309.17453' }],
    },
    {
      slug: 'two-position-effects',
      target: 'end',
      sources: [{ slug: 'wu-position-bias', url: 'https://arxiv.org/abs/2502.01951' }],
    },
    {
      slug: 'the-strength-varies',
      target: 'study-note',
      sources: [{ slug: 'veseli-positional-biases-shift', url: 'https://arxiv.org/abs/2508.07479' }],
    },
    { slug: 'planted-facts-not-chat-products', target: 'study-note', sources: [LIU] },
  ],
  segments: [
    { slug: 'meet-the-summer-party-chat' },
    { slug: 'it-happens-in-a-long-chat-too' },
    { slug: 'a-shape-not-a-brain' },
    { slug: 'what-a-lost-detail-costs' },
  ],
  content: ({ t, marker, Marker, target }) => {
    const band = (name: Band, left: readonly ReactNode[], right: readonly ReactNode[]): BandCopy => {
      const pill = t(`bands.${name}`);
      if (name === 'standout') return { pill, marker: null, left, right };
      return {
        pill,
        marker: <Marker note={BAND_NOTES[name]} placement="beside" className={ON_PILL} />,
        target: target(name),
        left,
        right,
      };
    };
    return (
      <SlideFrame className="gap-6">
        <ThreadPair
          copy={{
            stepsLabel: t('stepsLabel'),
            sister: { name: t('sister.name'), meta: t('sister.meta') },
            ai: { name: t('ai.name'), meta: t('ai.meta') },
            bands: {
              start: band('start', [t('left.0'), t('left.1')], [t.rich('right.m3', { budget }), t('right.m4')]),
              middle: band(
                'middle',
                [t('left.3'), t('left.4'), t('left.5')],
                [
                  t('right.m7'),
                  t('tools.web'),
                  t('right.m9'),
                  t('right.m10'),
                  t('tools.pdf'),
                  t('right.m13'),
                  t('right.m15'),
                ],
              ),
              standout: band('standout', [t('left.6')], [t.rich('right.m18')]),
              end: band('end', [t('left.8'), t('left.9')], [t('right.m22'), t.rich('right.m24', { cost, budget })]),
            },
            standoutNote: t('standoutNote'),
            overBudget: t('overBudget'),
            bottomLine: t.rich('bottomLine', { muted }),
          }}
        />
        <p {...target('study-note')} className="text-caption text-muted-foreground">
          {t.rich('studyNote', {
            planted: marker('planted-facts-not-chat-products'),
            varies: marker('the-strength-varies'),
          })}
        </p>
      </SlideFrame>
    );
  },
});
