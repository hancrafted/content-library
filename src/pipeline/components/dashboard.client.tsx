'use client';

import { useDashboardReplay } from '@/pipeline/hooks/use-dashboard-replay';
import { useEpisodeDashboard } from '@/pipeline/hooks/use-episode-dashboard';
import type { EpisodeOutputs } from '@/pipeline/lib/dashboard-outputs.pure';
import type { Polled } from '@/pipeline/lib/dashboard-reader.pure';
import { BrowserHelp, ChooseFolder, DashboardEntry, DemoNotice, OpenDemo, PrivacyNote } from './dashboard-entry';
import type { DashboardCopy } from './dashboard-evidence';
import { DashboardGraph } from './dashboard-graph.client';
import { SpecButton } from './dashboard-job-links';
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
            moment={{ now, replaying: !controls.live }}
            observedJobs={read.view?.jobs ?? []}
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

function SpecLink({ specPort, copy }: { specPort?: number; copy: DashboardCopy }) {
  return specPort === undefined ? null : <SpecButton port={specPort} copy={copy} />;
}

type Source = ReturnType<typeof useEpisodeDashboard>;

function Chooser({ source, copy }: { source: Source; copy: DashboardCopy }) {
  return (
    <ChooseFolder
      choose={source.choose}
      choosing={source.choosing}
      supported={source.supported}
      copy={copy}
      variant="outline"
    />
  );
}

/** The opened source's name and controls; a demo Run carries its notice right under it. */
function SourceBar({ source, specPort, copy }: { source: Source; specPort?: number; copy: DashboardCopy }) {
  return (
    <>
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border pb-3">
        <span className="truncate font-mono text-caption text-muted-foreground" title={source.name}>
          {source.name}
        </span>
        <div className="flex shrink-0 items-center justify-end gap-3">
          <SpecLink specPort={specPort} copy={copy} />
          <Chooser source={source} copy={copy} />
        </div>
      </div>
      {source.isDemo ? <DemoNotice copy={copy} /> : null}
    </>
  );
}

function Entry({ source, copy }: { source: Source; copy: DashboardCopy }) {
  return (
    <DashboardEntry copy={copy}>
      <div className="flex flex-wrap gap-3">
        <OpenDemo open={source.demo} choosing={source.choosing} copy={copy} />
        <Chooser source={source} copy={copy} />
      </div>
      <BrowserHelp supported={source.supported} copy={copy} />
    </DashboardEntry>
  );
}

export function Dashboard({ copy }: { copy: DashboardCopy }) {
  const source = useEpisodeDashboard();
  const { polled } = source;
  return (
    <div className="space-y-6">
      {polled?.read.view ? (
        <>
          <SourceBar source={source} specPort={polled.read.pipeline?.specPort} copy={copy} />
          <LiveDashboard polled={polled} outputs={source.outputs} name={source.name} copy={copy} />
        </>
      ) : (
        <Entry source={source} copy={copy} />
      )}
      {source.error ? <SourceErrors errors={[source.error]} copy={copy} /> : null}
      <PrivacyNote copy={copy} />
    </div>
  );
}
