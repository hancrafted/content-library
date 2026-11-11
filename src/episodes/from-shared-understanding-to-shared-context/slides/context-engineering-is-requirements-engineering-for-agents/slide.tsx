import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { OutcomeBoard } from '@/episodes/components/slide-shared/dartboard/outcome-board';
import { cn } from '@/shared/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { WindowCard } from './window-card';

const ANTHROPIC = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const MA = { slug: 'ma-requirement-driven-llm-use', url: 'https://arxiv.org/abs/2409.08775' };
const CHEN = { slug: 'chen-promptware-engineering', url: 'https://arxiv.org/abs/2503.02400' };
const OSMANI = { slug: 'osmani-new-sdlc', url: 'https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding' };

/** The four parts of Google's definition, in its order, each read as what a requirement has always said. */
const DEFINITION_PARTS = ['codebase', 'architecture', 'conventions', 'intent'] as const;

/**
 * The four outcomes of the dartboard, each as the shared board it lands and the window that produced it: the same
 * boards Slide 6 draws, so one outcome looks the same on both.
 */
const OUTCOMES = [
  { key: 'both', board: 'precise-accurate', quality: 'crisp', miss: false },
  { key: 'precise', board: 'precise-off', quality: 'crisp', miss: true },
  { key: 'accurate', board: 'accurate-scattered', quality: 'vague', miss: false },
  { key: 'neither', board: 'neither', quality: 'vague', miss: true },
] as const;

/** Down the column, from the window to the board it lands. */
function UpArrow() {
  return (
    <svg viewBox="0 0 40 24" className="mx-auto h-6 w-10" aria-hidden="true">
      <path
        d="M20 22 v-18 m-8 8 l8 -8 l8 8"
        className="fill-none stroke-muted-foreground"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * "Context engineering is requirements engineering for agents" (Spec Option 8a): Google's definition in the caption, its
 * four parts read as a requirement on a card (Han's feedback), then one bike order, four columns, each
 * dartboard standing over the context window that produces it. Overrules `grid-1x2` for the four columns; keeps
 * `motion: none`. The boards are the shared `Dartboard` and `Darts`; hover dims the other columns.
 */
export const contextEngineeringIsRequirementsEngineeringForAgents = slide({
  slug: 'context-engineering-is-requirements-engineering-for-agents',
  messages: { en, de },
  captionNote: 'googles-definition',
  notes: [
    { slug: 'googles-definition', target: 'caption', sources: [OSMANI] },
    { slug: 'the-definition', target: 'quote', sources: [ANTHROPIC] },
    { slug: 'input-quality-tracks-output-quality', target: 'customer', sources: [MA] },
    { slug: 'a-proposal-not-a-finding', target: 'limits', sources: [CHEN] },
    { slug: 'where-the-parallel-stops', target: 'limits', sources: [ANTHROPIC] },
  ],
  segments: [{ slug: 'the-definition' }, { slug: 'same-four-outcomes' }],
  content: ({ t, target, marker, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <div data-definition-card className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4">
        <p className="text-caption font-medium text-muted-foreground">{t('definitionCard.heading')}</p>
        <dl className="grid gap-x-6 gap-y-2 @xl:grid-cols-2 @5xl:grid-cols-4">
          {DEFINITION_PARTS.map((part) => (
            <div key={part} data-definition-part={part} className="flex flex-col">
              <dt className="text-body font-semibold">{t(`definitionCard.${part}.term`)}</dt>
              <dd className="text-body text-muted-foreground">→ {t(`definitionCard.${part}.everyday`)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div
        {...target('customer')}
        className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-5 py-3"
      >
        <span className="rounded-full bg-human px-3 py-1 text-caption font-medium text-background">
          {t('customer.label')}
        </span>
        <p className="text-body">{t('customer.text')}</p>
        <span className="inline-flex items-center gap-1 text-caption text-muted-foreground @3xl:ml-auto">
          {t('customer.same')}
          <Marker note="input-quality-tracks-output-quality" placement="beside" />
        </span>
      </div>
      <div className="focus-group focus-group--dim-others grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
        {OUTCOMES.map(({ key, board, quality, miss }) => (
          <div
            key={key}
            data-outcome={key}
            className={cn(
              'focus-group__item flex flex-col gap-3 rounded-xl bg-muted p-4',
              key === 'both' && 'ring-2 ring-primary',
            )}
          >
            <p className={cn('text-body font-semibold', key === 'both' && 'text-primary')}>
              {t(`outcomes.${key}.label`)}
            </p>
            <OutcomeBoard outcome={board} className="mx-auto h-auto w-3/4" />
            <UpArrow />
            <WindowCard
              label={t('window')}
              order={t(`outcomes.${key}.order`)}
              verdict={t(`outcomes.${key}.verdict`)}
              quality={quality}
              miss={miss}
            />
          </div>
        ))}
      </div>
      <div className="grid gap-x-6 gap-y-2 border-t border-border pt-4 text-caption text-muted-foreground @3xl:grid-cols-12">
        <p {...target('quote')} className="@3xl:col-span-7">
          {t.rich('quote', { definition: marker('the-definition') })}
        </p>
        <p {...target('limits')} className="@3xl:col-span-5">
          {t.rich('limits', {
            proposal: marker('a-proposal-not-a-finding'),
            stops: marker('where-the-parallel-stops'),
          })}
        </p>
      </div>
    </SlideFrame>
  ),
});
