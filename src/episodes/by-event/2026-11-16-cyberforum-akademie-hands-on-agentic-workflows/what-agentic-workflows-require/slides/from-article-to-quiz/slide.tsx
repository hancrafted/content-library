import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ContractCard } from '@/episodes/components/slide-shared/contract-card/contract-card';
import { OversightPill } from '@/episodes/components/slide-shared/oversight-pill/oversight-pill';
import { Pin } from '@/episodes/components/slide-shared/pin/pin';
import { HumanInTheLoop } from '@/explorables/human-in-the-loop/human-in-the-loop';
import type { WorkflowId } from '@/explorables/human-in-the-loop/workflow-data';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { StepLegend } from './step-legend';

const ANTHROPIC_AGENTS = {
  slug: 'anthropic-building-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};

/**
 * The Workflow the Explorable runs. The summer-party Workflow stands in for the quiz Workflow, whose stages it shares
 * (Plan, Requirements, Research, Page); the Slide swaps this one value when the quiz Workflow lands.
 */
const WORKFLOW: WorkflowId = 'summer-party';

type Handoff = 'planRequirements' | 'requirementsResearch' | 'researchPage';

export const fromArticleToQuiz = slide({
  slug: 'from-article-to-quiz',
  messages: { en, de },
  notes: [{ slug: 'workflow-and-agent-two-levels', target: 'two-levels', sources: [ANTHROPIC_AGENTS] }],
  segments: [
    { slug: 'one-whole-workflow' },
    { slug: 'in-on-or-out-per-step' },
    { slug: 'a-contract-at-every-handoff' },
    { slug: 'designed-around-the-goal' },
  ],
  content: ({ t, locale, Marker, target }) => {
    const level = (key: 'in' | 'on') => <OversightPill label={t(`levels.${key}`)} />;
    const terms = { receives: t('terms.receives'), delivers: t('terms.delivers'), checkedBy: t('terms.checkedBy') };
    const contract = (handoff: Handoff, pin?: 2) => (
      <div className="relative">
        <ContractCard
          size="note"
          heading={t(`contracts.${handoff}.seam`)}
          terms={terms}
          receives={t(`contracts.${handoff}.receives`)}
          delivers={t(`contracts.${handoff}.delivers`)}
          checkedBy={t(`contracts.${handoff}.checkedBy`)}
        />
        {pin !== undefined && <Pin n={pin} className="absolute -top-3 right-2" />}
      </div>
    );
    return (
      <SlideFrame className="gap-8 @container">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-md">
          <p className="flex w-fit items-center gap-2 self-end rounded-full border-2 border-dashed border-primary px-3 py-1 text-caption font-semibold">
            <Pin n={3} />
            <span data-quiz-goal>{t('goal')}</span>
          </p>
          <HumanInTheLoop
            workflow={WORKFLOW}
            locale={locale}
            view="stages"
            diagram={{
              label: t('workflowLabel'),
              stages: {
                plan: {
                  marker: (
                    <>
                      {level('in')}
                      <Pin n={1} />
                    </>
                  ),
                  after: contract('planRequirements', 2),
                },
                requirements: { marker: level('in'), after: contract('requirementsResearch') },
                research: { marker: level('on'), after: contract('researchPage') },
                page: {
                  marker: (
                    <>
                      {level('in')}
                      <Pin n={4} />
                    </>
                  ),
                },
              },
            }}
          />
          <p {...target('two-levels')} className="flex items-center gap-2 text-caption text-muted-foreground">
            {t('twoLevels')}
            <Marker note="workflow-and-agent-two-levels" placement="beside" />
          </p>
        </div>
        <StepLegend
          steps={[
            { slug: 'process', pin: 1, text: t.rich('steps.process') },
            { slug: 'contract', pin: 2, text: t.rich('steps.contract') },
            { slug: 'conway', pin: 3, text: t.rich('steps.conway') },
            { slug: 'skills', pin: 4, text: t.rich('steps.skills') },
          ]}
        />
      </SlideFrame>
    );
  },
});
