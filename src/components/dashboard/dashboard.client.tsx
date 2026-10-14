'use client';

import { useDashboardReplay } from '@/hooks/use-dashboard-replay';
import { useEpisodeDashboard } from '@/hooks/use-episode-dashboard';
import type { EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import type { EpisodeRead } from '@/lib/dashboard-reader.pure';
import type { ReactNode } from 'react';
import { BrowserHelp, ChooseFolder, DashboardEntry, PrivacyNote } from './dashboard-entry';
import type { DashboardCopy } from './dashboard-evidence';
import { DashboardGraph } from './dashboard-graph.client';
import { OpenGates, ReaderFooter, SourceErrors, SourceStatus } from './dashboard-source';
import { TimeTravel } from './dashboard-time-travel';

interface LiveProps {
  read: EpisodeRead;
  readAt: number;
  outputs: EpisodeOutputs;
  name?: string;
  chooser: ReactNode;
  copy: DashboardCopy;
}

function LiveDashboard({ read, readAt, outputs, name, chooser, copy }: LiveProps) {
  const replay = useDashboardReplay(read, readAt);
  const { view } = replay;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SourceStatus read={read} name={name} copy={copy} />
        {chooser}
      </div>
      <SourceErrors errors={read.errors} copy={copy} condition={read.condition} />
      {view ? (
        <>
          <TimeTravel replay={replay} copy={copy} />
          <OpenGates view={view} copy={copy} />
          <DashboardGraph
            key={name}
            view={view}
            events={read.events}
            stale={read.condition !== 'live'}
            replaying={!replay.live}
            outputs={outputs}
            copy={copy}
          />
        </>
      ) : null}
      <ReaderFooter read={read} copy={copy} />
    </>
  );
}

export function Dashboard({ copy }: { copy: DashboardCopy }) {
  const source = useEpisodeDashboard();
  const { read } = source;
  const chooser = (
    <ChooseFolder choose={source.choose} choosing={source.choosing} supported={source.supported} copy={copy} />
  );
  return (
    <div className="space-y-6">
      {read?.view && source.readAt !== undefined ? (
        <LiveDashboard
          read={read}
          readAt={source.readAt}
          outputs={source.outputs}
          name={source.name}
          chooser={chooser}
          copy={copy}
        />
      ) : (
        <DashboardEntry copy={copy}>
          {chooser}
          <BrowserHelp supported={source.supported} copy={copy} />
        </DashboardEntry>
      )}
      {source.error ? <SourceErrors errors={[source.error]} copy={copy} /> : null}
      <PrivacyNote copy={copy} />
    </div>
  );
}
