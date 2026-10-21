import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { contextData } from '@/components/slide-shared/context-window/context-data';
import { ContextWindow } from '@/components/slide-shared/context-window/context-window';
import { AttentionStrip } from './attention-strip';
import { stripSegments } from './attention-strip.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

const ANTHROPIC_CONTEXT_ENGINEERING = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const FOUND_IN_THE_MIDDLE = { slug: 'hsieh-found-in-the-middle', url: 'https://arxiv.org/abs/2406.16008' };
const LOST_IN_THE_MIDDLE = { slug: 'liu-lost-in-the-middle', url: 'https://arxiv.org/abs/2307.03172' };
const ATTENTION_SINKS = { slug: 'xiao-attention-sinks', url: 'https://arxiv.org/abs/2309.17453' };
const NOLIMA = { slug: 'modarressi-nolima', url: 'https://arxiv.org/abs/2502.05167' };

/** The summer party at its last step, as the Brief splits its attention: the opening three and the newest three. */
const CHAT = 'summer-party';
const STEP = '21';
const START = ['m1', 'm2', 'm3'];
const NEWEST = ['m22', 'm23', 'm24'];

/** The strip's segments from the cornerstone's own attention table, so Slide 4's panel and this strip agree. */
function segmentsOf(locale: 'en' | 'de') {
  const data = contextData(locale);
  const units = data.attention[CHAT]?.[STEP];
  const chat = data.chats[CHAT];
  if (units === undefined || chat === undefined) throw new Error(`attention strip: no ${CHAT} attention at ${STEP}`);
  return stripSegments({ steps: chat.steps, units, start: START, newest: NEWEST });
}

/** The marker colour on the primary callout, where the muted default would not read. */
const ON_PRIMARY = 'text-primary-foreground hover:text-primary-foreground focus-visible:text-primary-foreground';

/**
 * "Attention is a budget" (Spec Option 5a, locked with Han's note): the 100-unit strip on top; under it, the live
 * cornerstone in its Slide 5 Preset (the Attention view, no toolbar, its own 200K | 1M switch with Matt Pocock's
 * line) beside the "Lost in the middle" callout; the zone legend at the foot. Keeps `basic-page`, `motion: none`.
 */
export const attentionIsABudget = slide({
  slug: 'attention-is-a-budget',
  messages: { en, de },
  notes: [
    { slug: 'the-attention-budget', target: 'strip', sources: [ANTHROPIC_CONTEXT_ENGINEERING] },
    { slug: 'the-u-shape-is-measured', target: 'lost', sources: [FOUND_IN_THE_MIDDLE, LOST_IN_THE_MIDDLE] },
    { slug: 'the-start-is-weighted', target: 'strip', sources: [ATTENTION_SINKS] },
    { slug: 'no-single-line', target: 'zones', sources: [NOLIMA] },
  ],
  segments: [
    { slug: 'a-hundred-units' },
    { slug: 'where-it-goes' },
    { slug: 'a-spike-in-the-middle' },
    { slug: 'smart-zone-and-dumb-zone' },
    { slug: 'having-it-is-not-using-it' },
    { slug: 'my-own-line' },
  ],
  content: ({ t, locale, marker, target }) => (
    <SlideFrame className="mt-8 gap-10">
      <AttentionStrip
        segments={segmentsOf(locale)}
        labels={{
          heading: t.rich('strip.heading', { marker: marker('the-attention-budget') }),
          illustrative: t('illustrative'),
          label: t('strip.label'),
          groups: {
            start: {
              head: t('strip.start.head'),
              line: t.rich('strip.start.line', { marker: marker('the-start-is-weighted') }),
            },
            middle: { head: t('strip.middle.head'), line: t('strip.middle.line') },
            newest: {
              head: t('strip.newest.head'),
              line: t.rich('strip.newest.line', { marker: marker('the-u-shape-is-measured') }),
            },
          },
          spike: { head: t('strip.spike.head'), line: t('strip.spike.line') },
        }}
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <p className="text-body text-muted-foreground">
            {t.rich('zones.pocock', { marker: marker('no-single-line') })}
          </p>
          <div {...target('lost')} className="rounded-xl bg-primary p-6 text-primary-foreground shadow-md">
            <p className="text-caption tracking-wide uppercase">{t('lost.kicker')}</p>
            <p className="text-subheading font-semibold">
              {t.rich('lost.name', { marker: marker('the-u-shape-is-measured', ON_PRIMARY) })}
            </p>
            <p className="text-body">{t('lost.body')}</p>
          </div>
        </div>
        <div className="min-w-0 lg:col-span-8">
          <ContextWindow preset="slide-5" locale={locale} />
        </div>
      </div>
      <div
        {...target('zones')}
        className="flex flex-col gap-4 rounded-xl bg-muted p-5 md:flex-row md:items-start md:justify-between md:gap-8"
      >
        <div className="flex flex-col gap-2 text-caption">
          <span className="flex items-start gap-2">
            <span className="mt-2 h-0 w-6 shrink-0 border-t-2 border-dashed border-primary" />
            <span>{t.rich('zones.smart')}</span>
          </span>
          <span className="flex items-start gap-2">
            <span className="mt-2 h-0 w-6 shrink-0 border-t-2 border-dashed border-muted-foreground" />
            <span>{t.rich('zones.dumb')}</span>
          </span>
        </div>
        <p className="max-w-md text-body">{t.rich('zones.note', { marker: marker('no-single-line') })}</p>
        <span className="self-start rounded-full border border-dashed border-border px-2 py-0.5 text-caption text-muted-foreground">
          {t('illustrative')}
        </span>
      </div>
    </SlideFrame>
  ),
});
