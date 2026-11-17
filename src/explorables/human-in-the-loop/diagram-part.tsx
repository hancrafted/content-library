import { DiagramJobs } from './diagram-jobs';
import { DiagramStages } from './diagram-stages';
import type { DiagramProps } from './human-in-the-loop.types';

export function DiagramPart(props: DiagramProps) {
  if (props.view === 'stages') return <DiagramStages {...props} />;
  return <DiagramJobs {...props} />;
}
