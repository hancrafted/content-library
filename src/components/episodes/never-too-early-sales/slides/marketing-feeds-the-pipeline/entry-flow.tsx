import { cn } from '@/lib/utils';
import { ArrowDown, ArrowRight } from 'lucide-react';
import styles from './marketing-feeds-the-pipeline.module.css';

interface EntryFlowProps {
  attention: string;
  viewers: string;
  pipeline: string;
  lead: string;
  opportunity: string;
  gate: string;
  branch: string;
  routes: readonly { slug: string; label: string }[];
}

const BOX = 'rounded-md border border-border bg-card p-4 text-body font-semibold text-foreground';
/** The anonymous viewers, drawn as a dozen dots: decoration beside their written label. */
const VIEWER_DOTS = Array.from({ length: 12 }, (_, index) => index);

function Attention({ attention, viewers }: Pick<EntryFlowProps, 'attention' | 'viewers'>) {
  return (
    <div data-attention className="flex flex-col gap-3">
      <p className={BOX}>{attention}</p>
      <div data-target="viewers" className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-3">
        <span aria-hidden="true" className="flex flex-wrap gap-2">
          {VIEWER_DOTS.map((dot) => (
            <span key={dot} className="size-1.5 rounded-full bg-muted-foreground" />
          ))}
        </span>
        <span className="text-caption text-muted-foreground">{viewers}</span>
      </div>
    </div>
  );
}

function Routes({ routes }: Pick<EntryFlowProps, 'routes'>) {
  return (
    <ul data-target="routes" className="flex flex-col gap-3">
      {routes.map(({ slug, label }) => (
        <li key={slug} className={cn(styles.route, 'flex gap-2')}>
          <span className="rounded-md border border-border bg-card p-3 text-caption text-foreground">{label}</span>
          <span aria-hidden="true" className={cn(styles.feed, 'bg-border')} />
          <ArrowRight aria-hidden="true" className={cn(styles.feedArrow, 'size-4 shrink-0 text-muted-foreground')} />
        </li>
      ))}
    </ul>
  );
}

function Pipeline(props: Pick<EntryFlowProps, 'pipeline' | 'lead' | 'opportunity' | 'gate' | 'branch'>) {
  return (
    <div data-target="pipeline" className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4">
      <span className="text-caption font-medium text-muted-foreground">{props.pipeline}</span>
      <p className={BOX}>{props.lead}</p>
      <p data-target="gate" className="border-l-2 border-foreground pl-3 text-caption font-medium text-foreground">
        {props.gate}
      </p>
      <p className="rounded-md border border-dashed border-border p-3 text-caption text-muted-foreground">
        {props.branch}
      </p>
      <ArrowDown aria-hidden="true" className="size-4 text-muted-foreground" />
      <p className={BOX}>{props.opportunity}</p>
    </div>
  );
}

/**
 * An original marketing-to-sales flow: attention and its anonymous viewers
 * outside the pipeline, three named entry routes feeding it, and inside the
 * dashed outline an identified lead that the gate qualifies, or not.
 */
export function EntryFlow(props: EntryFlowProps) {
  return (
    <div className={cn(styles.flow, 'grid items-start gap-6')}>
      <Attention attention={props.attention} viewers={props.viewers} />
      <Routes routes={props.routes} />
      <Pipeline {...props} />
    </div>
  );
}
