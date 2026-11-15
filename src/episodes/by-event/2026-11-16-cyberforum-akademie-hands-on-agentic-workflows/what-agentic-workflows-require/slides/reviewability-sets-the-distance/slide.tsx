import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { OversightPill } from '@/episodes/components/slide-shared/oversight-pill/oversight-pill';
import { GoalNote } from '@/episodes/components/slide-shared/party-notes/goal-note';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { LevelMove } from './level-move.client';
import { CheckCard, Handoff, RiskMeter, TaskNote } from './task-note';

const ANTHROPIC = {
  slug: 'anthropic-measuring-agent-autonomy',
  url: 'https://www.anthropic.com/research/measuring-agent-autonomy',
};
const PARASURAMAN_MANZEY = {
  slug: 'parasuraman-manzey-complacency-and-bias',
  url: 'https://doi.org/10.1177/0018720810376055',
};
const PSW = { slug: 'parasuraman-sheridan-wickens-levels-of-automation', url: 'https://doi.org/10.1109/3468.844354' };
const AI_ACT = { slug: 'eu-ai-act-article-14', url: 'https://artificialintelligenceact.eu/article/14/' };
const OPENAI = {
  slug: 'openai-practical-guide-to-building-agents',
  url: 'https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf',
};

const SOFTWARE = 'software-is-easy-to-check';
const VIGILANCE = 'vigilance-is-no-check';
const DESIGN_CHOICE = 'level-is-a-design-choice';
const TOOL_RATING = 'risk-as-a-tool-rating';
const ONE_INPUT = 'risk-is-one-input-not-the-rule';

/** The primary arrow of the activity's move, from its former level to its new one. */
function MoveArrow() {
  return (
    <svg viewBox="0 0 40 16" className="w-8 shrink-0" aria-hidden="true">
      <path d="M2 8H34M28 3L36 8L28 13" className="fill-none stroke-primary" strokeWidth={3} />
    </svg>
  );
}

/**
 * "Reviewability sets the distance" (Spec Option 6b): the party board in workflow order, guest list, venue and
 * activity to the goal note at the right edge, each note naming its risk, what a wrong result can do and what checks
 * it beside its level. The activity stays high risk, but its pill has moved from in to on because a check card is now
 * pinned to it: the Slide's one local motion slides that pill on its first `active` and on hover or focus. Keeps
 * `basic-page`. The check boxes stay empty: the `success` tick is reserved for a later Slide.
 */
export const reviewabilitySetsTheDistance = slide({
  slug: 'reviewability-sets-the-distance',
  messages: { en, de },
  captionNote: 'oversight-follows-risk-in-the-rules',
  notes: [
    { slug: SOFTWARE, target: 'hedge', sources: [ANTHROPIC] },
    { slug: VIGILANCE, target: 'check-card', sources: [PARASURAMAN_MANZEY] },
    { slug: DESIGN_CHOICE, target: 'board', sources: [PSW] },
    { slug: 'oversight-follows-risk-in-the-rules', target: 'caption', sources: [AI_ACT] },
    { slug: TOOL_RATING, target: 'guest-list', sources: [OPENAI] },
    { slug: ONE_INPUT, target: 'hedge', sources: [PSW] },
  ],
  segments: [
    { slug: 'the-rule' },
    { slug: 'hypothesis-said-openly' },
    { slug: 'risk-too' },
    { slug: 'make-it-checkable' },
  ],
  content: ({ t, target, marker, Marker }) => (
    <SlideFrame className="@container">
      <div className="flex flex-col gap-10">
        <div {...target('board')} className="flex flex-col gap-6 rounded-xl bg-muted px-4 py-8 @3xl:px-6 @3xl:py-10">
          <p className="flex items-center gap-2 text-caption text-muted-foreground uppercase">
            {t('board.label')}
            <Marker note={DESIGN_CHOICE} placement="beside" />
          </p>
          <div className="flex flex-col items-stretch gap-2 @4xl:flex-row @4xl:items-start @4xl:gap-0">
            <TaskNote
              className="min-w-0 -rotate-1 @4xl:flex-1"
              targetProps={target('guest-list')}
              agent={t('agent')}
              label={t('tasks.guestList.label')}
              fact={t('tasks.guestList.fact')}
              risk={
                <RiskMeter
                  label={t('risk.label')}
                  value={1}
                  valueLabel={t('risk.value', { value: 1 })}
                  marker={<Marker note={TOOL_RATING} placement="beside" />}
                />
              }
              ifWrong={t('tasks.guestList.ifWrong')}
              checkedBy={t('tasks.guestList.checkedBy')}
              level={<OversightPill label={t('levels.out')} className="px-2" />}
            />
            <Handoff label={t('handoffs.guests')} className="@4xl:w-16" />
            <TaskNote
              className="min-w-0 rotate-1 @4xl:flex-1"
              agent={t('agent')}
              label={t('tasks.venue.label')}
              fact={t('tasks.venue.fact')}
              risk={<RiskMeter label={t('risk.label')} value={3} valueLabel={t('risk.value', { value: 3 })} />}
              ifWrong={t('tasks.venue.ifWrong')}
              checkedBy={t('tasks.venue.checkedBy')}
              level={<OversightPill label={t('levels.on')} className="px-2" />}
            />
            <Handoff label={t('handoffs.venue')} className="@4xl:w-16" />
            <div className="flex shrink-0 flex-col gap-3 @4xl:w-1/4">
              <TaskNote
                className="p-4"
                agent={t('agent')}
                label={t('tasks.activity.label')}
                fact={t('tasks.activity.fact')}
                was={t('tasks.activity.was')}
                risk={<RiskMeter label={t('risk.label')} value={3} valueLabel={t('risk.value', { value: 3 })} />}
                ifWrong={t('tasks.activity.ifWrong')}
                level={
                  <LevelMove
                    label={t('tasks.activity.move')}
                    from={<OversightPill label={t('levels.was')} former className="px-2" />}
                    arrow={<MoveArrow />}
                    to={<OversightPill label={t('levels.on')} className="px-2" />}
                  />
                }
              />
              <CheckCard
                targetProps={target('check-card')}
                heading={t('checkCard.heading')}
                checks={[
                  { text: t('checkCard.checks.join') },
                  { text: t('checkCard.checks.access') },
                  { text: t('checkCard.checks.fitness'), marker: <Marker note={VIGILANCE} placement="beside" /> },
                ]}
              />
            </div>
            <Handoff label={t('handoffs.programme')} className="@4xl:w-20" />
            <GoalNote label={t('goal.label')} text={t('goal.text')} className="shrink-0 @4xl:w-1/6" />
          </div>
        </div>
        <p {...target('hedge')} className="text-body text-muted-foreground">
          {t.rich('hedge', { risk: marker(ONE_INPUT), software: marker(SOFTWARE) })}
        </p>
      </div>
    </SlideFrame>
  ),
});
