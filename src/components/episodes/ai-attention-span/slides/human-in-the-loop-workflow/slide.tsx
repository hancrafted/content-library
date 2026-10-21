import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import {
  CompareJob,
  InterviewJob,
  PartyPieces,
  RequirementsCard,
  ResearchChats,
  VenuePlan,
} from '@/components/slide-shared/venue-pipeline/stage-jobs';
import { VenuePipeline, type StageView } from '@/components/slide-shared/venue-pipeline/venue-pipeline';
import { STAGES, type StageId } from '@/components/slide-shared/venue-pipeline/venue-pipeline.pure';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

const CLEAN_WINDOWS = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const CONTEXT_LENGTH = { slug: 'du-context-length-alone-hurts', url: 'https://arxiv.org/abs/2510.05381' };

const CRITERIA = ['guests', 'budget', 'stepFree', 'vegetarian', 'quiet'] as const;
const jobsOf = (id: StageId) => STAGES.find((stage) => stage.id === id)?.jobs ?? [];

const WORKERS = 'workers';
const LOOP_NOTE = 'loop-note';

/**
 * The human in the loop workflow: the brief-the-venue pipeline whole (its columns, connectors and the fan-out to the
 * worker chats and back in), only without bold first letters and the acronym unnamed. The loop strip did not fit
 * beside it at 1280x800, so its message (planner chat, worker chats, you checking) lives in the caption.
 */
export const humanInTheLoopWorkflow = slide({
  slug: 'human-in-the-loop-workflow',
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
    const view = (id: StageId, body: ReactNode, extra: Partial<StageView> = {}): StageView => ({
      stage: STAGES.find((stage) => stage.id === id) ?? STAGES[0],
      name: t(`stages.${id}.name`),
      move: t(`stages.${id}.move`),
      jobsLabel: t('jobsLabel', { stage: t(`stages.${id}.name`) }),
      body,
      ...extra,
    });
    const stages: StageView[] = [
      view(
        'party',
        <PartyPieces
          jobs={jobsOf('party')}
          names={{
            venue: t('jobs.party.venue'),
            travel: t('jobs.party.travel'),
            catering: t('jobs.party.catering'),
            invitations: t('jobs.party.invitations'),
            budget: t('jobs.party.budget'),
          }}
        />,
      ),
      view(
        'interview',
        <InterviewJob
          label={t('jobs.interview.label')}
          detail={t('jobs.interview.detail')}
          forgot={t.rich('jobs.interview.forgot', { marker: (chunks) => chunks })}
        />,
      ),
      view(
        'requirements',
        <RequirementsCard
          gate={t('card.gate')}
          title={t('card.title')}
          criteria={CRITERIA.map((criterion) => t(`card.criteria.${criterion}`))}
          signOff={t('card.signOff')}
          marker={null}
        />,
      ),
      view(
        'research',
        <ResearchChats
          jobs={jobsOf('research')}
          names={{
            venue1: t('jobs.research.venue1'),
            venue2: t('jobs.research.venue2'),
            venue3: t('jobs.research.venue3'),
          }}
          checked={t('jobs.research.checked')}
        />,
        { target: target(WORKERS), aside: <Marker note="clean-windows-for-each-part" placement="beside" /> },
      ),
      view(
        'compare',
        <CompareJob
          label={t('jobs.compare.label')}
          detail={t('jobs.compare.detail')}
          gate={t('jobs.compare.gate')}
          marker={null}
        />,
      ),
      view(
        'recommendation',
        <VenuePlan label={t('jobs.recommendation.label')} detail={t('jobs.recommendation.detail')} />,
      ),
    ];
    return (
      <SlideFrame className="mt-10 gap-10">
        <div className="@container">
          <VenuePipeline label={t('pipelineLabel')} stages={stages} acronym={false} />
        </div>
        <p {...target(LOOP_NOTE)} className="text-caption text-pretty text-muted-foreground">
          {t.rich('loop.note', { marker: marker('short-tasks-beat-long-ones') })}
        </p>
      </SlideFrame>
    );
  },
});
