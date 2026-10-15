'use client';

import { useDashboardReplay } from '@/hooks/use-dashboard-replay';
import { useEpisodeDashboard, type Polled } from '@/hooks/use-episode-dashboard';
import type { EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import { BrowserHelp, ChooseFolder, DashboardEntry, PrivacyNote } from './dashboard-entry';
import type { DashboardCopy } from './dashboard-evidence';
import { DashboardGraph } from './dashboard-graph.client';
import { OpenGates, ReaderFooter, SourceErrors } from './dashboard-source';

interface LiveProps {
  polled: Polled;
  outputs: EpisodeOutputs;
  name?: string;
  copy: DashboardCopy;
}

function LiveDashboard({ polled, outputs, name, copy }: LiveProps) {
  const { read } = polled;
  const { controls, view, events, now } = useDashboardReplay(polled);
  return (
    <>
      <SourceErrors errors={read.errors} copy={copy} condition={read.condition} />
      {view ? (
        <>
          <OpenGates view={view} copy={copy} />
          <DashboardGraph
            key={name}
            view={view}
            events={events}
            stale={read.condition !== 'live'}
            moment={{ now, replaying: !controls.live, observedJobs: read.view?.jobs, observedAt: polled.readAt }}
            outputs={outputs}
            copy={copy}
            replay={controls}
          />
        </>
      ) : null}
      <ReaderFooter read={read} copy={copy} />
    </>
  );
}

export function Dashboard({ copy }: { copy: DashboardCopy }) {
  const source = useEpisodeDashboard();
  const { polled } = source;
  const chooser = (
    <ChooseFolder choose={source.choose} choosing={source.choosing} supported={source.supported} copy={copy} />
  );
  return (
    <div className="space-y-6">
      <header className="flex min-w-0 items-center justify-between gap-3 border-b border-border pb-3">
        <h1 className="shrink-0 text-body font-semibold">{copy.title}</h1>
        <div className="flex min-w-0 items-center justify-end gap-3">
          <span className="truncate font-mono text-caption text-muted-foreground" title={source.name}>
            {source.name}
          </span>
          {chooser}
        </div>
      </header>
      {polled?.read.view ? (
        <LiveDashboard polled={polled} outputs={source.outputs} name={source.name} copy={copy} />
      ) : (
        <DashboardEntry copy={copy}>
          <BrowserHelp supported={source.supported} copy={copy} />
        </DashboardEntry>
      )}
      {source.error ? <SourceErrors errors={[source.error]} copy={copy} /> : null}
      <PrivacyNote copy={copy} />
    </div>
  );
}
