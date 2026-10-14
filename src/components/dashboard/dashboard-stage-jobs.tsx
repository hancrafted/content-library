import type { DashboardJob } from '@/lib/dashboard-projection.pure';
import { jobLabel, needsAttention, runningAgents, stageLayers, type DashboardStage } from '@/lib/dashboard-stages.pure';
import { fillTemplate } from '@/lib/template.pure';
import { ArrowDown, CircleAlert, GitBranch } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';
import { StageStateIcon } from './dashboard-state-icon';

export type SelectJob = (stage: string, job: string) => void;

interface JobProps {
  stage: DashboardStage;
  job: DashboardJob;
  onSelectJob: SelectJob;
  copy: DashboardCopy;
}

function JobStatus({ job, copy }: Pick<JobProps, 'job' | 'copy'>) {
  const sessions = runningAgents(job).length;
  if (job.foreach !== undefined) {
    const heading = job.foreach.split('#').at(-1) ?? job.foreach;
    return (
      <span className="block text-caption text-muted-foreground">{fillTemplate(copy.graph.onePer, { heading })}</span>
    );
  }
  return (
    <>
      <span className="block text-caption text-(--node-tone)">
        {job.state === 'gate' ? copy.waitingOnHan : job.state}
      </span>
      {sessions > 0 ? (
        <span className="block text-caption text-(--info)">
          {fillTemplate(copy.graph.running, { count: sessions })}
        </span>
      ) : null}
    </>
  );
}

/** A fan-out Job shows its readable label; screen readers and the tooltip keep the full id. */
function JobName({ id }: { id: string }) {
  const label = jobLabel(id);
  if (label === id) return <span className="block text-caption font-medium">{id}</span>;
  return (
    <span className="block text-caption font-medium">
      <span className="sr-only">{id}</span>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}

function AttentionMarker({ job, copy }: Pick<JobProps, 'job' | 'copy'>) {
  if (!needsAttention(job.state)) return null;
  return (
    <CircleAlert
      role="img"
      aria-label={fillTemplate(copy.graph.attention, { count: 1 })}
      className="size-4 shrink-0 text-(--warning)"
    />
  );
}

function JobNode({ stage, job, onSelectJob, copy }: JobProps) {
  const template = job.foreach !== undefined;
  return (
    <li className="min-w-0">
      <button
        type="button"
        data-job={job.id}
        title={job.id}
        data-state={template ? 'template' : job.state}
        aria-controls="dashboard-stage-detail"
        onClick={() => onSelectJob(stage.id, job.id)}
        className={`${styles.job} cursor-pointer transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
      >
        <span className={styles.jobDot}>
          <StageStateIcon state={job.state} className="size-4" />
        </span>
        <span className="min-w-0 flex-1 wrap-anywhere">
          <JobName id={job.id} />
          <JobStatus job={job} copy={copy} />
        </span>
        <AttentionMarker job={job} copy={copy} />
      </button>
    </li>
  );
}

function Layer({ jobs, index, ...props }: Omit<JobProps, 'job'> & { jobs: DashboardJob[]; index: number }) {
  return (
    <li className="space-y-2">
      {index > 0 ? <ArrowDown aria-hidden="true" className="mx-auto size-4 text-muted-foreground" /> : null}
      {jobs.length > 1 ? (
        <p className="flex items-center gap-1 text-caption text-muted-foreground">
          <GitBranch aria-hidden="true" className="size-4 shrink-0" />
          {fillTemplate(props.copy.graph.parallel, { count: jobs.length })}
        </p>
      ) : null}
      <ul className="space-y-2" aria-label={fillTemplate(props.copy.graph.step, { number: index + 1 })}>
        {jobs.map((job) => (
          <JobNode key={job.id} job={job} {...props} />
        ))}
      </ul>
    </li>
  );
}

/** A stage's Jobs in dependency layers: a layer's Jobs run in parallel, the next layer follows it. */
export function StageJobs({ stage, index, onSelectJob, copy }: Omit<JobProps, 'job'> & { index: number }) {
  const style = { '--stage-index': index } as CSSProperties;
  if (stage.jobs.length === 0) return null;
  return (
    <ol className={`${styles.jobs} space-y-2`} style={style} data-stage-jobs={stage.id}>
      {stageLayers(stage).map((jobs, layer) => (
        <Layer key={layer} jobs={jobs} index={layer} stage={stage} onSelectJob={onSelectJob} copy={copy} />
      ))}
    </ol>
  );
}
