'use client';

import { useDashboardReplay } from '@/hooks/use-dashboard-replay';
import { useEpisodeDashboard, type Polled } from '@/hooks/use-episode-dashboard';
import type { EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import type { ReactNode } from 'react';
import { BrowserHelp, ChooseFolder, DashboardEntry, PrivacyNote } from './dashboard-entry';
import type { DashboardCopy } from './dashboard-evidence';
import { DashboardGraph } from './dashboard-graph.client';
import { OpenGates, ReaderFooter, SourceErrors, SourceStatus } from './dashboard-source';
import { TimeTravel } from './dashboard-time-travel.client';

interface LiveProps {
  polled: Polled;
  outputs: EpisodeOutputs;
  name?: string;
  chooser: ReactNode;
  copy: DashboardCopy;
}

function LiveDashboard({ polled, outputs, name, chooser, copy }: LiveProps) {
  const { read } = polled;
  const { controls, view, events, now } = useDashboardReplay(polled);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SourceStatus read={read} name={name} copy={copy} />
        {chooser}
      </div>
      <SourceErrors errors={read.errors} copy={copy} condition={read.condition} />
      {view ? (
        <>
          <TimeTravel replay={controls} copy={copy} />
          <OpenGates view={view} copy={copy} />
          <DashboardGraph
            key={name}
            view={view}
            events={events}
            stale={read.condition !== 'live'}
            moment={{ now, replaying: !controls.live }}
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
  const { polled } = source;
  const chooser = (
    <ChooseFolder choose={source.choose} choosing={source.choosing} supported={source.supported} copy={copy} />
  );
  return (
    <div className="space-y-6">
      {polled?.read.view ? (
        <LiveDashboard polled={polled} outputs={source.outputs} name={source.name} chooser={chooser} copy={copy} />
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
