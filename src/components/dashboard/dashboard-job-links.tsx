import { isGlob, outputLabel, previewHref, previewPort, type EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import type { DashboardJob } from '@/lib/dashboard-projection.pure';
import { fillTemplate } from '@/lib/template.pure';
import { ExternalLink, FileText } from 'lucide-react';
import type { DashboardCopy } from './dashboard-evidence';

const LINK =
  'inline-flex min-w-0 items-center gap-2 rounded-md text-caption font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/**
 * A Build Job's dev server on its pipeline port, shown while `previewPort` says it is meant to answer. A
 * button, not a link: FE-003 admits no `http:` href, and the dev server is plain http on localhost.
 */
export function PreviewButton({
  job,
  copy,
  className = '',
}: {
  job: DashboardJob;
  copy: DashboardCopy;
  className?: string;
}) {
  const port = previewPort(job);
  if (port === undefined) return null;
  const url = previewHref(port);
  return (
    <button
      type="button"
      data-preview={url}
      title={url}
      onClick={() => window.open(url, '_blank', 'noopener')}
      className={`${LINK} min-h-8 cursor-pointer ${className}`}
    >
      <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
      {fillTemplate(copy.graph.preview, { port })}
      <span className="sr-only">{copy.graph.previewHelp}</span>
    </button>
  );
}

function OutputItem({ output, outputs, copy }: { output: string; outputs: EpisodeOutputs; copy: DashboardCopy }) {
  const label = outputLabel(output);
  if (isGlob(output)) return <li className="font-mono text-caption text-muted-foreground wrap-anywhere">{label}</li>;
  const written = outputs.written.has(output);
  return (
    <li>
      <button
        type="button"
        data-output={output}
        disabled={!written}
        onClick={() => outputs.open(output)}
        className={`${LINK} min-h-11 cursor-pointer text-left disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline`}
      >
        <FileText aria-hidden="true" className="size-4 shrink-0" />
        <span className="font-mono wrap-anywhere">{label}</span>
        {written ? (
          <span className="sr-only">{copy.graph.openOutput}</span>
        ) : (
          <span className="font-normal">· {copy.graph.notWritten}</span>
        )}
      </button>
    </li>
  );
}

/** A Job's output files, each opened read-only as plain text in a new tab once written, and its preview link. */
export function JobLinks({ job, outputs, copy }: { job: DashboardJob; outputs: EpisodeOutputs; copy: DashboardCopy }) {
  if (job.outputs.length === 0 && previewPort(job) === undefined) return null;
  return (
    <section className="space-y-1" aria-label={copy.graph.outputs}>
      <PreviewButton job={job} copy={copy} className="min-h-11" />
      {job.outputs.length > 0 ? (
        <>
          <h3 className="text-caption text-muted-foreground">{copy.graph.outputs}</h3>
          <ul>
            {job.outputs.map((output) => (
              <OutputItem key={output} output={output} outputs={outputs} copy={copy} />
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
