'use client';

import { useEpisodeDashboard } from '@/hooks/use-episode-dashboard';
import type { EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import type { EpisodeRead } from '@/lib/dashboard-reader.pure';
import type { ReactNode } from 'react';
import { BrowserHelp, ChooseFolder, DashboardEntry, PrivacyNote } from './dashboard-entry';
import type { DashboardCopy } from './dashboard-evidence';
import { DashboardGraph } from './dashboard-graph.client';
import { OpenGates, ReaderFooter, SourceErrors, SourceStatus } from './dashboard-source';

interface LiveProps {
  read: EpisodeRead;
  outputs: EpisodeOutputs;
  name?: string;
  chooser: ReactNode;
  copy: DashboardCopy;
}

function LiveDashboard({ read, outputs, name, chooser, copy }: LiveProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SourceStatus read={read} name={name} copy={copy} />
        {chooser}
      </div>
      <SourceErrors errors={read.errors} copy={copy} condition={read.condition} />
      {read.view ? (
        <>
          <OpenGates view={read.view} copy={copy} />
          <DashboardGraph
            key={name}
            view={read.view}
            events={read.events}
            stale={read.condition !== 'live'}
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
      {read?.view ? (
        <LiveDashboard read={read} outputs={source.outputs} name={source.name} chooser={chooser} copy={copy} />
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
