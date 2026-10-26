import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Context } from '@/explorable-explanations/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { LostBracket } from './lost-bracket.client';

const ANTHROPIC_CONTEXT_ENGINEERING = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const FOUND_IN_THE_MIDDLE = { slug: 'hsieh-found-in-the-middle', url: 'https://arxiv.org/abs/2406.16008' };
const LOST_IN_THE_MIDDLE = { slug: 'liu-lost-in-the-middle', url: 'https://arxiv.org/abs/2307.03172' };
const ATTENTION_SINKS = { slug: 'xiao-attention-sinks', url: 'https://arxiv.org/abs/2309.17453' };
const NOLIMA = { slug: 'modarressi-nolima', url: 'https://arxiv.org/abs/2502.05167' };

/** The marker colour on the primary callout, where the muted default would not read. */
const ON_PRIMARY = 'text-primary-foreground hover:text-primary-foreground focus-visible:text-primary-foreground';

/**
 * "Attention is a budget" (Spec Option 5a, simplified by Han's batch-2 feedback): the live cornerstone in its Slide 5
 * Preset, with the timeline left, the window as a Simple bar with its 200K | 1M switch and smart zone, and the
 * attention on the right. The "Lost in the middle" card sits right of the attention card, level with its middle rows and marked by a curly bracket (no arrow); below, the caveat that the line differs per model. Keeps `basic-page`,
 * `motion: none`.
 */
export const attentionIsABudget = slide({
  slug: 'attention-is-a-budget',
  messages: { en, de },
  notes: [
    { slug: 'the-attention-budget', target: 'attention', sources: [ANTHROPIC_CONTEXT_ENGINEERING] },
    { slug: 'the-u-shape-is-measured', target: 'lost', sources: [FOUND_IN_THE_MIDDLE, LOST_IN_THE_MIDDLE] },
    { slug: 'the-start-is-weighted', target: 'attention', sources: [ATTENTION_SINKS] },
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
    <SlideFrame className="mt-8 gap-6">
      <div {...target('attention')} data-lost-host="" className="@container relative flex flex-col gap-3">
        <div className="@3xl:pr-[17rem]">
          <Context preset="slide-5" locale={locale} />
        </div>
        {/* Right of the attention card, level with its middle rows; below the card on a narrow slide. */}
        <div {...target('lost')} data-lost-label="" className="@3xl:absolute @3xl:inset-y-0 @3xl:right-0 @3xl:w-64">
          <LostBracket>
            <div className="w-full rounded-xl bg-primary p-4 text-primary-foreground shadow-md">
              <p className="text-caption tracking-wide uppercase">{t('lost.kicker')}</p>
              <p className="text-body font-semibold">
                {t.rich('lost.name', { marker: marker('the-u-shape-is-measured', ON_PRIMARY) })}
              </p>
              <p className="text-caption">
                {t.rich('lost.body', {
                  budget: marker('the-attention-budget', ON_PRIMARY),
                  start: marker('the-start-is-weighted', ON_PRIMARY),
                })}
              </p>
            </div>
          </LostBracket>
        </div>
      </div>
      <p {...target('zones')} className="flex flex-wrap items-center gap-3 text-body text-muted-foreground">
        <span>{t.rich('zones.note', { marker: marker('no-single-line') })}</span>
        <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-caption">
          {t('illustrative')}
        </span>
      </p>
    </SlideFrame>
  ),
});
