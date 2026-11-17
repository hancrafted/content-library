import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { OversightPill } from '@/episodes/components/slide-shared/oversight-pill/oversight-pill';
import { GoalNote } from '@/episodes/components/slide-shared/party-notes/goal-note';
import { Callout } from './callout';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { LevelMove } from './level-move.client';
import { CheckCard, Handoff, RiskMeter, TaskNote, TrustMeter } from './task-note';
import { TrustChain } from './trust-chain';
import { trustLevel } from './trust.pure';

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

/** Each task's trust: what a wrong result needs (set by risk) and what its check has proved. */
const GUEST_LIST = { needed: 1, earned: 1 } as const;
const VENUE = { needed: 3, earned: 3 } as const;
/** The activity before its check card (trustLevel: in, a person stayed in) and after it. */
const ACTIVITY_BEFORE = { needed: 3, earned: 1 } as const;
const ACTIVITY = { needed: 3, earned: 3 } as const;

/** The primary arrow of the activity's move, from its former level to its new one. */
function MoveArrow() {
  return (
    <svg viewBox="0 0 40 16" className="w-8 shrink-0" aria-hidden="true">
      <path d="M2 8H34M28 3L36 8L28 13" className="fill-none stroke-primary" strokeWidth={3} />
    </svg>
  );
}

/**
 * "Trust lets you step out; review builds the trust" (Spec Option 6b, redesigned from the decision page of 2026-11-16):
 * a chain of three linked boxes, engineer for review, earned trust, step out, over the party board in workflow order.
 * Each note shows the trust it needs (set by what a wrong result can do) beside the trust it has earned (set by its
 * check), and its level follows from the two (`trustLevel`). The activity needed 3 and had 1, so a person stayed in;
 * its check card is pinned to it, the trust is earned, and its pill slides from in to on on the Slide's first `active`
 * and on hover or focus. Numbered callouts 1 to 3 join the chain to the check card, the earned-trust meter and the
 * moving pill. Keeps `basic-page` and the slug, so the published anchor holds. The check boxes stay empty: the
 * `success` tick is reserved for a later Slide.
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
    { slug: 'review-builds-the-trust' },
    { slug: 'risk-sets-the-bar' },
    { slug: 'the-activity-moves' },
  ],
  content: ({ t, target, marker, Marker }) => (
    <SlideFrame className="@container">
      <div className="flex flex-col gap-10">
        <TrustChain
          review={t('chain.review')}
          trust={t('chain.trust')}
          step={t('chain.step')}
          levels={[t('chain.levels.in'), t('chain.levels.on'), t('chain.levels.out')]}
        />
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
                  label={t('trust.needed')}
                  value={GUEST_LIST.needed}
                  valueLabel={t('trust.neededValue', { value: GUEST_LIST.needed })}
                  marker={<Marker note={TOOL_RATING} placement="beside" />}
                />
              }
              trust={
                <TrustMeter
                  label={t('trust.earned')}
                  value={GUEST_LIST.earned}
                  needed={GUEST_LIST.needed}
                  valueLabel={t('trust.earnedValue', { value: GUEST_LIST.earned })}
                />
              }
              ifWrong={t('tasks.guestList.ifWrong')}
              checkedBy={t('tasks.guestList.checkedBy')}
              level={<OversightPill label={t(`levels.${trustLevel(GUEST_LIST)}`)} className="px-2" />}
            />
            <Handoff label={t('handoffs.guests')} className="@4xl:w-16" />
            <TaskNote
              className="min-w-0 rotate-1 @4xl:flex-1"
              agent={t('agent')}
              label={t('tasks.venue.label')}
              fact={t('tasks.venue.fact')}
              risk={
                <RiskMeter
                  label={t('trust.needed')}
                  value={VENUE.needed}
                  valueLabel={t('trust.neededValue', { value: VENUE.needed })}
                />
              }
              trust={
                <TrustMeter
                  label={t('trust.earned')}
                  value={VENUE.earned}
                  needed={VENUE.needed}
                  valueLabel={t('trust.earnedValue', { value: VENUE.earned })}
                />
              }
              ifWrong={t('tasks.venue.ifWrong')}
              checkedBy={t('tasks.venue.checkedBy')}
              level={<OversightPill label={t(`levels.${trustLevel(VENUE)}`)} className="px-2" />}
            />
            <Handoff label={t('handoffs.venue')} className="@4xl:w-16" />
            <div className="flex shrink-0 flex-col gap-3 @4xl:w-1/4">
              <TaskNote
                className="p-4"
                agent={t('agent')}
                label={t('tasks.activity.label')}
                fact={t('tasks.activity.fact')}
                was={t('tasks.activity.was')}
                risk={
                  <RiskMeter
                    label={t('trust.needed')}
                    value={ACTIVITY.needed}
                    valueLabel={t('trust.neededValue', { value: ACTIVITY.needed })}
                  />
                }
                trust={
                  <TrustMeter
                    label={t('trust.earned')}
                    value={ACTIVITY.earned}
                    needed={ACTIVITY.needed}
                    valueLabel={t('trust.earnedValue', { value: ACTIVITY.earned })}
                    was={t('trust.was', { value: ACTIVITY_BEFORE.earned })}
                    marker={<Callout n={2} />}
                  />
                }
                ifWrong={t('tasks.activity.ifWrong')}
                level={
                  <LevelMove
                    label={t('tasks.activity.move')}
                    callout={<Callout n={3} />}
                    from={<OversightPill label={t('levels.was')} former className="px-2" />}
                    arrow={<MoveArrow />}
                    to={<OversightPill label={t(`levels.${trustLevel(ACTIVITY)}`)} className="px-2" />}
                  />
                }
              />
              <CheckCard
                targetProps={target('check-card')}
                heading={t('checkCard.heading')}
                meaning={t('checkCard.meaning')}
                callout={<Callout n={1} />}
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
