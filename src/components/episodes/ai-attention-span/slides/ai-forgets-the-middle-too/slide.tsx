import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ThreadPair, type Band, type BandCopy } from './thread-pair';

const LIU = { slug: 'liu-lost-in-the-middle', url: 'https://arxiv.org/abs/2307.03172' };

/** The Speaker note each band's pill opens. */
const BAND_NOTES = {
  start: 'a-built-in-pull-to-the-start',
  middle: 'measured-even-for-long-input-models',
  end: 'two-position-effects',
} as const satisfies Record<Band, string>;

/** The pill's Context marker on its dark pill. */
const ON_PILL = 'text-background/70 hover:text-foreground focus-visible:text-foreground';

/** The budget in the Episode's one budget tint. */
const budget = (chunks: ReactNode) => (
  <span className="rounded-md bg-(--warning)/25 px-1 font-semibold whitespace-nowrap">{chunks}</span>
);
const muted = (chunks: ReactNode) => <span className="text-muted-foreground">{chunks}</span>;

/*
 * "AI forgets the middle too" (Spec Option 2a): the sister thread and the summer-party chat side by side on
 * `SlideFrame`, aligned on three bands, so the same lighting lands on both. The Slide header above shows the title
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
            sister: { name: t('sister.name'), meta: t('sister.meta') },
            ai: { name: t('ai.name'), meta: t('ai.meta') },
            bands: {
              start: band('start', [t('left.0'), t('left.1')], [t('right.0'), t('right.1')]),
              middle: band(
                'middle',
                [t.rich('left.2', { budget }), t('left.3'), t('left.4')],
                [t.rich('right.2', { budget }), t('right.3'), t('tools.web')],
              ),
              end: band(
                'end',
                [t.rich('left.5', { budget }), t('left.6')],
                [t('right.4'), t.rich('right.5', { budget })],
              ),
            },
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
