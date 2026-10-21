import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { VenuePipeline, type StageView } from '@/components/slide-shared/venue-pipeline/venue-pipeline';
import { STAGES } from '@/components/slide-shared/venue-pipeline/venue-pipeline.pure';
import { HumanLoopStrip } from './human-loop-strip';
import de from './i18n/de.json';
import en from './i18n/en.json';

const CLEAN_WINDOWS = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const CONTEXT_LENGTH = { slug: 'du-context-length-alone-hurts', url: 'https://arxiv.org/abs/2510.05381' };

const WORKERS = 'workers';
const LOOP_NOTE = 'loop-note';

/**
 * The human in the loop workflow: a compact recall of the brief's stages (the venue pipeline's names and moves, its first letters not
 * bold and the acronym unnamed, an example of a brief), over the loop itself as one strip: you, the planner chat, a
 * handoff, the worker chats, their results, the planner and you again, with a check on each artifact between. The old
 * one-chat-against-workflow comparison is dropped: the strip carries the workflow and the page has no room for both.
 */
export const theWorkflowForBiggerProjects = slide({
  slug: 'the-workflow-for-bigger-projects',
  messages: { en, de },
  notes: [
    { slug: 'clean-windows-for-each-part', target: WORKERS, sources: [CLEAN_WINDOWS] },
    { slug: 'short-tasks-beat-long-ones', target: LOOP_NOTE, sources: [CONTEXT_LENGTH] },
  ],
  segments: [
    { slug: 'recall' },
    { slug: 'human-in-the-loop' },
    { slug: 'planner-and-handoff' },
    { slug: 'worker-chats' },
    { slug: 'you-check' },
  ],
  content: ({ t, target, marker, Marker }) => {
    const stages: StageView[] = STAGES.map((stage) => ({
      stage,
      name: t(`stages.${stage.id}.name`),
      move: t(`stages.${stage.id}.move`),
      jobsLabel: '',
      body: null,
    }));
    return (
      <SlideFrame className="mt-8 gap-6">
        <section className="@container flex flex-col gap-3">
          <p className="text-caption font-medium text-muted-foreground uppercase">{t('recallLabel')}</p>
          <VenuePipeline label={t('pipelineLabel')} stages={stages} acronym={false} compact />
        </section>
        <HumanLoopStrip
          label={t('loop.label')}
          you={t('loop.you')}
          youRole={t('loop.youRole')}
          planner={t('loop.planner')}
          workers={t('loop.workers')}
          workersMarker={<Marker note="clean-windows-for-each-part" placement="beside" />}
          workerNames={[t('loop.workerNames.0'), t('loop.workerNames.1'), t('loop.workerNames.2')]}
          handoff={t('loop.handoff')}
          results={t('loop.results')}
          plannerAgain={t('loop.plannerAgain')}
          youAgain={t('loop.youAgain')}
          checked={t('loop.checked')}
          check={t('loop.check')}
          workersTarget={target(WORKERS)}
        />
        <p {...target(LOOP_NOTE)} className="text-caption text-pretty text-muted-foreground">
          {t.rich('loop.note', { marker: marker('short-tasks-beat-long-ones') })}
        </p>
      </SlideFrame>
    );
  },
});
