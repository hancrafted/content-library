'use client';

import type { DiagramProps } from './human-in-the-loop.types';

/** The diagram part. A stub until the diagram ticket draws the stages, jobs and connectors from `workflow`. */
export function DiagramPart({ workflow, openJobId, onOpenJob }: DiagramProps) {
  return (
    <ol data-part="diagram" aria-label={workflow.title}>
      {workflow.stages.map((stage) => (
        <li key={stage.id}>
          {stage.name}
          {stage.jobs.map((job) => (
            <button key={job.id} type="button" aria-pressed={job.id === openJobId} onClick={() => onOpenJob(job.id)}>
              {job.title}
            </button>
          ))}
        </li>
      ))}
    </ol>
  );
}
