import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { DraftStrip } from './draft-strip';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { LeanBoard } from './lean-board';
import { TipLegend } from './tip-legend';

const ANTHROPIC_AGENTS = {
  slug: 'anthropic-building-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};
const TOMASEV = { slug: 'tomasev-intelligent-delegation', url: 'https://arxiv.org/abs/2602.11865' };
const ANTHROPIC_RESEARCH = {
  slug: 'anthropic-multi-agent-research',
  url: 'https://www.anthropic.com/engineering/multi-agent-research-system',
};

const BEFORE = [
  { slug: 'venue', steps: 14 },
  { slug: 'catering', steps: 1 },
  { slug: 'travel', steps: 1 },
] as const;

function DownArrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <path
        d="M12 2 V20 M6 14 L12 20 L18 14"
        className="fill-none stroke-foreground"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const designedAiFirst = slide({
  slug: 'designed-ai-first',
  messages: { en, de },
  notes: [
    { slug: 'checkpoints-in-the-path', target: 'board', sources: [ANTHROPIC_AGENTS] },
    { slug: 'contract-first-decomposition', target: 'tips', sources: [TOMASEV] },
    { slug: 'vague-handoffs-duplicate-work', target: 'tips', sources: [ANTHROPIC_RESEARCH] },
  ],
  segments: [
    { slug: 'start-at-the-outcome' },
    { slug: 'contract-on-every-milestone' },
    { slug: 'cut-seams' },
    { slug: 'not-more-meetings' },
  ],
  content: ({ t, marker, target }) => {
    const terms = { receives: t('terms.receives'), delivers: t('terms.delivers'), checkedBy: t('terms.checkedBy') };
    const agent = { doer: 'ai', doerLabel: t('doers.agent') } as const;
    return (
      <SlideFrame className="gap-6 @container">
        <DraftStrip
          label={t('before.label')}
          columns={BEFORE.map((column) => ({ ...column, label: t(`before.columns.${column.slug}`) }))}
          note={t('before.note')}
        />
        <p className="flex items-center gap-3 text-caption font-semibold text-muted-foreground uppercase">
          <DownArrow />
          {t('after.label')}
        </p>
        <div {...target('board')}>
          <LeanBoard
            notes={[
              {
                slug: 'travel',
                text: t('board.travel.text'),
                ...agent,
                pin: 3,
                contract: {
                  size: 'note',
                  terms,
                  delivers: t('board.travel.delivers'),
                  checkedBy: t('board.travel.checkedBy'),
                },
              },
              {
                slug: 'venue',
                text: t('board.venue.text'),
                ...agent,
                contract: {
                  size: 'note',
                  terms,
                  delivers: t('board.venue.delivers'),
                  checkedBy: t.rich('board.venue.checkedBy', { marker: marker('checkpoints-in-the-path') }),
                },
              },
              {
                slug: 'food',
                text: t('board.food.text'),
                ...agent,
                contractPin: 2,
                contract: {
                  size: 'note',
                  filled: true,
                  terms,
                  receives: t('board.food.receives'),
                  delivers: t('board.food.delivers'),
                  checkedBy: t('board.food.checkedBy'),
                  how: t('board.food.how'),
                },
              },
              {
                slug: 'activities',
                text: t('board.activities.text'),
                doer: 'human',
                doerLabel: t('doers.person'),
                contract: {
                  size: 'note',
                  terms,
                  delivers: t('board.activities.delivers'),
                  checkedBy: t('board.activities.checkedBy'),
                },
              },
              {
                slug: 'shuttle',
                text: t('board.shuttle.text'),
                ...agent,
                contract: {
                  size: 'note',
                  terms,
                  delivers: t('board.shuttle.delivers'),
                  checkedBy: t('board.shuttle.checkedBy'),
                },
              },
            ]}
            goalLabel={t('goalLabel')}
            goal={t('goal')}
            outcome={t('outcome')}
            goalPin={1}
          />
        </div>
        <div {...target('tips')}>
          <TipLegend
            tips={[
              { slug: 'outcome', pin: 1, text: t.rich('tips.outcome') },
              {
                slug: 'contract',
                pin: 2,
                text: t.rich('tips.contract', {
                  marker: marker('contract-first-decomposition'),
                }),
              },
              {
                slug: 'seams',
                pin: 3,
                text: t.rich('tips.seams', {
                  marker: marker('vague-handoffs-duplicate-work'),
                }),
              },
            ]}
          />
        </div>
        <p data-payoff className="text-body text-muted-foreground">
          {t('payoff')}
        </p>
      </SlideFrame>
    );
  },
});
