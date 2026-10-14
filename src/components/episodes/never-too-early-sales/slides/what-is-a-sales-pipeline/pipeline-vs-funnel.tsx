import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import styles from './what-is-a-sales-pipeline.module.css';

interface PipelineVsFunnelProps {
  pipelineLabel: string;
  funnelLabel: string;
  stages: readonly { slug: string; label: string }[];
}

type Stages = PipelineVsFunnelProps['stages'];

/** The pipeline: outlined record chips joined by arrows, left to right, or top down when narrow. */
function PipelineFlow({ label, stages }: { label: string; stages: Stages }) {
  return (
    <figure data-target="pipeline" className="flex flex-col gap-4 rounded-md border border-border p-4">
      <figcaption className="text-body font-semibold text-foreground">{label}</figcaption>
      <ol className={cn(styles.flow, 'flex gap-2')}>
        {stages.map(({ slug, label: stage }, index) => (
          <li key={slug} className={cn(styles.flowStep, 'flex items-center gap-2')}>
            {index > 0 && (
              <ArrowRight aria-hidden="true" className={cn(styles.flowArrow, 'size-4 text-muted-foreground')} />
            )}
            <span className="rounded-md border border-border bg-card px-3 py-1 text-caption text-foreground">
              {stage}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** The funnel: centred bars narrowing symbolically, no counts; each stage name is the visible text. */
function CountlessFunnel({ label, stages }: { label: string; stages: Stages }) {
  return (
    <figure data-target="funnel" className="flex flex-col gap-4 rounded-md border border-border p-4">
      <figcaption className="text-body font-semibold text-foreground">{label}</figcaption>
      <ol className="flex flex-col gap-2">
        {stages.map(({ slug, label: stage }) => (
          <li key={slug} className={cn(styles.funnelRow, 'grid items-center gap-3')}>
            <span className="flex justify-center">
              <span
                data-bar={slug}
                aria-hidden="true"
                className={cn(styles.bar, 'h-6 rounded-sm border border-border bg-muted')}
              />
            </span>
            <span className="text-caption text-foreground">{stage}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/**
 * The same three stages read two ways: the pipeline as records with next
 * actions, the funnel as how many progress. The stage names carry the
 * meaning; the bars and arrows are decoration.
 */
export function PipelineVsFunnel({ pipelineLabel, funnelLabel, stages }: PipelineVsFunnelProps) {
  return (
    <div className={cn(styles.figures, 'grid gap-8')}>
      <PipelineFlow label={pipelineLabel} stages={stages} />
      <CountlessFunnel label={funnelLabel} stages={stages} />
    </div>
  );
}
