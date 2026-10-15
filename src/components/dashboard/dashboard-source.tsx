import type { DashboardView } from '@/lib/dashboard-projection.pure';
import type { EpisodeRead } from '@/lib/dashboard-reader.pure';
import type { DashboardCopy } from './dashboard-evidence';

export function SourceErrors({
  errors,
  copy,
  condition = 'error',
}: {
  errors: string[];
  copy: DashboardCopy;
  condition?: EpisodeRead['condition'];
}) {
  if (errors.length === 0) return null;
  return (
    <div
      role={condition === 'waiting' ? 'status' : 'alert'}
      className="space-y-2 rounded-xl border border-(--warning)/40 bg-(--warning)/10 p-4 text-caption"
    >
      <p className="font-medium">{condition === 'waiting' ? copy.waiting : copy.error}</p>
      <ul className="list-inside list-disc space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="whitespace-pre-wrap wrap-anywhere">
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OpenGates({ view, copy }: { view: DashboardView; copy: DashboardCopy }) {
  if (view.openGates.length === 0) return null;
  return (
    <section role="status" className="space-y-3 rounded-xl border border-(--warning) bg-(--warning)/10 p-5">
      <h2 className="text-body font-semibold text-(--warning)">{copy.waitingOnHan}</h2>
      <p className="text-caption">{copy.gateHelp}</p>
      <ul className="space-y-2">
        {view.openGates.map((gate) => (
          <li key={gate.span_id} className="text-caption">
            <span className="font-medium">
              {gate.job ?? gate.name} · {gate.name}
            </span>
            <time className="ml-2 text-muted-foreground" dateTime={gate.start_t}>
              {gate.start_t}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReaderFooter({ read, copy }: { read: EpisodeRead; copy: DashboardCopy }) {
  return (
    <footer className="flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-4 text-caption font-mono text-muted-foreground tabular-nums">
      <span>
        {copy.debug}: {read.offset.toLocaleString('en-US')} {copy.bytes}
      </span>
      <span>
        {read.lines.toLocaleString('en-US')} {copy.lines}
      </span>
      <span>{copy.refresh}</span>
    </footer>
  );
}
