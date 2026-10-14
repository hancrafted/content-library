'use client';

import { useEpisodeDashboard } from '@/hooks/use-episode-dashboard';
import { BrowserHelp, ChooseFolder, DashboardEntry, PrivacyNote } from './dashboard-entry';
import type { DashboardCopy } from './dashboard-evidence';
import { DashboardJobs } from './dashboard-jobs';
import { OpenGates, ReaderFooter, SourceErrors, SourceStatus } from './dashboard-source';

export function Dashboard({ copy }: { copy: DashboardCopy }) {
  const source = useEpisodeDashboard();
  const { read } = source;
  const chooser = (
    <ChooseFolder choose={source.choose} choosing={source.choosing} supported={source.supported} copy={copy} />
  );
  return (
    <div className="space-y-6">
      {read?.view ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SourceStatus read={read} name={source.name} copy={copy} />
            {chooser}
          </div>
          <SourceErrors errors={read.errors} copy={copy} condition={read.condition} />
          <OpenGates view={read.view} copy={copy} />
          <DashboardJobs view={read.view} copy={copy} />
          <ReaderFooter read={read} copy={copy} />
        </>
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
