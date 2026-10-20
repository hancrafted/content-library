import { Button } from '@/components/ui/button';
import { spanElapsed } from '@/lib/dashboard-elapsed.pure';
import type { EventScope } from '@/lib/dashboard-events.pure';
import type { JobNode, StageNode } from '@/lib/dashboard-graph-view.pure';
import type { EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import { fillTemplate } from '@/lib/template.pure';
import { useContext } from 'react';
import { JobChipDetail } from './dashboard-chips';
import { ElapsedTime, JobFailureNote, StateBadge, type DashboardCopy } from './dashboard-evidence';
import { JobLinks } from './dashboard-job-links';
import { JobEvidence } from './dashboard-jobs';
import { DashboardMoment } from './dashboard-moment';
import { AttentionMarker } from './dashboard-state-icon';

export type OpenEventLog = (title: string, scope: EventScope) => void;
interface DetailProps {
  copy: DashboardCopy;
  outputs: EpisodeOutputs;
  openLog: OpenEventLog;
}

function TicketLogs({ node, copy, openLog }: Pick<DetailProps, 'copy' | 'openLog'> & { node: JobNode }) {
  return node.tickets.map((ticket) => {
    const label = fillTemplate(copy.graph.ticket, { number: ticket });
    return (
      <Button key={ticket} variant="outline" onClick={() => openLog(label, { jobs: [node.id], ticket })}>
        {label} · {copy.graph.logs}
      </Button>
    );
  });
}

export function JobDetail({ node, copy, outputs, openLog }: DetailProps & { node: JobNode }) {
  const { now } = useContext(DashboardMoment);
  const { job } = node;
  return (
    <div id={`dashboard-job-${job.id}`} className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-caption">
        <StateBadge state={job.state} />
        {job.span ? <ElapsedTime elapsed={spanElapsed(job.span, now)} copy={copy} /> : null}
        <AttentionMarker attention={node.attention} label={copy.graph.jobAttention} />
      </div>
      <JobFailureNote job={job} copy={copy} />
      <JobLinks job={job} outputs={outputs} copy={copy} />
      <JobChipDetail job={job} copy={copy} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => openLog(job.id, { jobs: [job.id] })}>
          {copy.graph.logs}
        </Button>
        <TicketLogs node={node} copy={copy} openLog={openLog} />
      </div>
      <JobEvidence job={job} copy={copy} />
    </div>
  );
}

export function StageDetail({ stage, copy, outputs, openLog }: DetailProps & { stage: StageNode }) {
  return (
    <div className="space-y-5">
      <StateBadge state={stage.state} />
      {stage.jobs.length === 0 ? <p className="text-caption text-muted-foreground">{copy.graph.notPlanned}</p> : null}
      <Button variant="outline" onClick={() => openLog(stage.id, { jobs: stage.jobs.map((job) => job.id) })}>
        {copy.graph.logs}
      </Button>
      {stage.nodes.map((node) => (
        <details key={node.id} className="border-t border-border pt-3">
          <summary className="cursor-pointer py-2 text-body font-medium wrap-anywhere focus-visible:outline-2 focus-visible:outline-ring">
            {node.id}
          </summary>
          <div className="py-3">
            <JobDetail node={node} copy={copy} outputs={outputs} openLog={openLog} />
          </div>
        </details>
      ))}
    </div>
  );
}
