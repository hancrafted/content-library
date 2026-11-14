import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { HumanInTheLoop } from '@/explorables/human-in-the-loop/human-in-the-loop';
import { workflowFor } from '@/explorables/human-in-the-loop/workflow-data';
import { DesignBracket } from './design-bracket';
import { HandoffAside, HandoffRow } from './handoff-row';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MinimalChip } from './minimal-chip';
import { SteersLens } from './steers-lens';

const IBM = { slug: 'ibm-agentic-workflows', url: 'https://www.ibm.com/think/topics/agentic-workflows' };
const SALESFORCE = {
  slug: 'salesforce-agentic-workflows',
  url: 'https://www.salesforce.com/agentforce/agentic-workflows/',
};
const ANTHROPIC = {
  slug: 'anthropic-building-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};
const NG = { slug: 'ng-the-batch-253', url: 'https://www.deeplearning.ai/the-batch/issue-253/' };

const CAPTION = 'caption';
const RESEARCH = 'research';
const MINIMAL = 'minimal';

/** The summer party's four stages, in order: each hands its work to the next. */
const STAGES = ['plan', 'requirements', 'research', 'page'] as const;

/** Every toolbar control but the use-case picker and the Stages · Jobs switch, hidden. */
const HIDDEN = { show: false } as const;
const CONTROLS = {
  level: HIDDEN,
  demo: HIDDEN,
  debug: HIDDEN,
  download: HIDDEN,
  upload: HIDDEN,
  progressDownload: HIDDEN,
  progressUpload: HIDDEN,
  reset: HIDDEN,
};

/** The task you set the agent in the Research stage: the Workflow's own goal for its research job. */
function researchTask(locale: string): string {
  const workflow = workflowFor('summer-party', locale === 'de' ? 'de' : 'en');
  const task = workflow.stages.find(({ id }) => id === RESEARCH)?.jobs[0]?.task.goal.do;
  if (task === undefined) throw new Error('what-an-agentic-workflow-is-slide: the summer party has no research task');
  return locale === 'de' ? task : task.charAt(0).toLowerCase() + task.slice(1);
}

/**
 * What an agentic workflow is (picked Option 4a): the human-in-the-loop Explorable in its Stages view, running "Plan a
 * summer party". The path over it is bracketed as the part you design, each stage's handoff under it; one Research
 * round is zoomed below it as the part the agent steers, its task the Workflow's own and its steps its own call. The
 * open phrase "minimal human intervention" closes the Slide as a question for the next Section.
 */
export const whatAnAgenticWorkflowIsSlide = slide({
  slug: 'what-an-agentic-workflow-is-slide',
  messages: { en, de },
  captionNote: 'ibm-wording',
  notes: [
    { slug: 'ibm-wording', target: CAPTION, sources: [IBM] },
    { slug: 'salesforce-wording', target: CAPTION, sources: [SALESFORCE] },
    { slug: 'why-vendors-stress-autonomy', target: MINIMAL, sources: [IBM] },
    { slug: 'two-levels-of-control', target: RESEARCH, sources: [ANTHROPIC] },
    { slug: 'autonomy-as-a-degree', target: MINIMAL, sources: [NG] },
  ],
  segments: [{ slug: 'the-definition' }, { slug: 'two-levels' }, { slug: 'minimal-how-minimal' }],
  content: ({ t, locale, target, Marker }) => {
    const handoffs = STAGES.map((stage) => ({ stage, text: t(`handoffs.${stage}`) }));
    const stage = (id: (typeof STAGES)[number]) => ({ aside: <HandoffAside text={t(`handoffs.${id}`)} /> });
    return (
      <SlideFrame className="@container mt-6 gap-3">
        <DesignBracket
          label={t('design.label')}
          hint={t('design.hint')}
          marker={<Marker note="two-levels-of-control" placement="beside" />}
        />
        <HumanInTheLoop
          workflow="summer-party"
          locale={locale}
          view="stages"
          controls={CONTROLS}
          diagram={{
            label: t('diagramLabel'),
            initials: false,
            stages: {
              plan: stage('plan'),
              requirements: { ...stage('requirements'), gateLabel: t('gate') },
              research: { ...stage('research'), target: target(RESEARCH) },
              page: { ...stage('page'), gateLabel: t('gate') },
            },
          }}
        />
        <HandoffRow label={t('handoffsLabel')} handoffs={handoffs} />
        <SteersLens
          label={t('steers.label')}
          agent={t('agent')}
          task={t('steers.task', { task: researchTask(locale) })}
          steps={[t('steers.steps.search'), t('steers.steps.compare'), t('steers.steps.source')]}
          done={t('steers.done')}
          marker={<Marker note="two-levels-of-control" placement="beside" />}
        />
        <div {...target(MINIMAL)}>
          <MinimalChip
            term={t('minimal.term')}
            question={t('minimal.question')}
            markers={
              <>
                <Marker note="autonomy-as-a-degree" placement="beside" />
                <Marker note="why-vendors-stress-autonomy" placement="beside" />
              </>
            }
          />
        </div>
      </SlideFrame>
    );
  },
});
