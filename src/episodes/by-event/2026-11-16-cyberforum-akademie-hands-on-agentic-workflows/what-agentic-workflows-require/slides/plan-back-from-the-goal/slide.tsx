import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { BoardNote, ExternalNote } from '@/episodes/components/slide-shared/party-board/sticky-note';
import { GoalNote, GoalTree } from './goal-tree';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { WellKnownCallout } from './well-known-callout';

const POLYA = {
  slug: 'polya-how-to-solve-it',
  url: 'https://www.hlevkin.com/hlevkin/90MathPhysBioBooks/Math/Polya/George_Polya_How%20to%20Solve%20It.pdf',
};
const RUSSELL_NORVIG = { slug: 'russell-norvig-planning', url: 'https://aima.cs.berkeley.edu/2nd-ed/newchap11.pdf' };
const KELLEY_WALKER = {
  slug: 'kelley-walker-critical-path',
  url: 'https://mosaicprojects.com.au/PDF/PM-History_Critical_Path_Planning_&_Scheduling_Kelley_and_Walker_1959.pdf',
};
const NASA_WBS = {
  slug: 'nasa-wbs-handbook',
  url: 'https://www.nasa.gov/wp-content/uploads/2025/06/nasa-wbs-handbook.pdf',
};
const ANTHROPIC_AGENTS = {
  slug: 'anthropic-building-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};
const YANG = { slug: 'yang-what-prompts-dont-say', url: 'https://arxiv.org/abs/2505.13360' };
const AMBIG_SWE = { slug: 'vijayvargiya-ambig-swe', url: 'https://arxiv.org/abs/2502.13069' };

const RULES = ['outcome', 'external', 'orphan'] as const;

/**
 * "Plan back from the goal" (Spec Option 7b): the goal breaks into two subgoals and each into the notes that must be
 * true before it, read right to left on the party board. Under "together", the venue and its kitchen, outside your
 * control; under "gets home safely", the two tasks nobody owned, each with the fixed mark, resolving Slide 1's drinking
 * drivers and cold guests. The three rules sit beside a call-out naming the method as well known. Keeps `basic-page`
 * and `motion: none`; no hover, the tree is read whole.
 */
export const planBackFromTheGoal = slide({
  slug: 'plan-back-from-the-goal',
  messages: { en, de },
  captionNote: 'pappus-and-polya',
  notes: [
    { slug: 'pappus-and-polya', target: 'caption', sources: [POLYA] },
    { slug: 'regression-in-planning', target: 'kitchen', sources: [RUSSELL_NORVIG] },
    { slug: 'fewer-actions-to-consider', target: 'tree', sources: [RUSSELL_NORVIG] },
    { slug: 'it-feels-wrong', target: 'tree', sources: [POLYA] },
    { slug: 'project-management-does-it-too', target: 'callout', sources: [KELLEY_WALKER] },
    { slug: 'what-the-backward-run-gives', target: 'callout', sources: [KELLEY_WALKER] },
    { slug: 'scope-starts-at-the-end-product', target: 'goal', sources: [NASA_WBS] },
    { slug: 'vendors-say-clear-goals', target: 'callout', sources: [ANTHROPIC_AGENTS] },
    { slug: 'missing-detail-costs-accuracy', target: 'callout', sources: [YANG] },
    { slug: 'asking-recovers-it-and-the-limit', target: 'callout', sources: [AMBIG_SWE] },
  ],
  segments: [
    { slug: 'start-at-the-goal' },
    { slug: 'state-the-outcome' },
    { slug: 'outside-your-control' },
    { slug: 'the-tasks-nobody-owned' },
    { slug: 'well-known-and-agents-like-it' },
  ],
  content: ({ t, marker, Marker, target }) => (
    <SlideFrame className="@container">
      <div className="flex flex-col gap-8">
        <div {...target('tree')} className="rounded-xl bg-muted p-5 @3xl:p-8">
          <GoalTree
            label={t('board')}
            columns={{ before: t('columns.before'), justBefore: t('columns.justBefore'), start: t('columns.start') }}
            goal={
              <div {...target('goal')} className="flex flex-1 flex-col">
                <GoalNote kicker={t('goal.kicker')} text={t('goal.text')} />
              </div>
            }
            branches={[
              {
                slug: 'together',
                subgoal: <BoardNote kicker={t('subgoals.kicker')} text={t('subgoals.together')} tilt="right" />,
                leaves: [
                  {
                    slug: 'venue',
                    note: (
                      <BoardNote
                        kicker={t('leaves.venue.kicker')}
                        text={t('leaves.venue.text')}
                        tilt="left"
                        className="flex-1"
                      />
                    ),
                  },
                  {
                    slug: 'kitchen',
                    note: (
                      <div {...target('kitchen')} className="flex flex-1 flex-col">
                        <ExternalNote
                          kicker={t('leaves.kitchen.kicker')}
                          text={t('leaves.kitchen.text')}
                          hint={t('leaves.kitchen.hint')}
                          marker={<Marker note="regression-in-planning" placement="beside" />}
                          className="flex-1"
                        />
                      </div>
                    ),
                  },
                ],
              },
              {
                slug: 'home',
                emphasis: true,
                subgoal: <BoardNote kicker={t('subgoals.kicker')} text={t('subgoals.home')} tilt="left" emphasis />,
                leaves: [
                  {
                    slug: 'shuttle',
                    note: (
                      <BoardNote
                        kicker={t('leaves.shuttle.kicker')}
                        text={t('leaves.shuttle.text')}
                        hint={t('leaves.shuttle.hint')}
                        tilt="right"
                        mark="fixed"
                        markLabel={t('fixed')}
                        className="flex-1"
                      />
                    ),
                  },
                  {
                    slug: 'warm-clothes',
                    note: (
                      <BoardNote
                        kicker={t('leaves.warmClothes.kicker')}
                        text={t('leaves.warmClothes.text')}
                        hint={t('leaves.warmClothes.hint')}
                        tilt="left"
                        mark="fixed"
                        markLabel={t('fixed')}
                        className="flex-1"
                      />
                    ),
                  },
                ],
              },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 items-start gap-8 @4xl:grid-cols-12">
          <ul className="flex flex-col gap-2 text-body @4xl:col-span-7">
            {RULES.map((rule) => (
              <li key={rule}>{t.rich(`rules.${rule}`)}</li>
            ))}
          </ul>
          <div {...target('callout')} className="@4xl:col-span-5">
            <WellKnownCallout
              label={t('callout.label')}
              items={[
                {
                  slug: 'pm',
                  lead: t('callout.pm.lead'),
                  text: t.rich('callout.pm.text', { pm: marker('project-management-does-it-too') }),
                },
                {
                  slug: 'agents',
                  lead: t('callout.agents.lead'),
                  text: t.rich('callout.agents.text', {
                    vendors: marker('vendors-say-clear-goals'),
                    missing: marker('missing-detail-costs-accuracy'),
                  }),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </SlideFrame>
  ),
});
