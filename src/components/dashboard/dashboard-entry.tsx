import { Button } from '@/components/ui/button';
import { FolderOpen, LockKeyhole } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DashboardCopy } from './dashboard-evidence';

export function ChooseFolder({
  choose,
  choosing,
  supported,
  copy,
}: {
  choose: () => void;
  choosing: boolean;
  supported: boolean | null;
  copy: DashboardCopy;
}) {
  return (
    <Button
      type="button"
      onClick={choose}
      disabled={choosing || supported !== true}
      aria-busy={choosing}
      className="h-auto min-h-11 min-w-0 max-w-full cursor-pointer whitespace-normal"
    >
      <FolderOpen aria-hidden="true" />
      {choosing ? copy.choosing : copy.choose}
    </Button>
  );
}

export function BrowserHelp({ supported, copy }: { supported: boolean | null; copy: DashboardCopy }) {
  const text = supported === null ? copy.hydrating : supported ? copy.compatibility : copy.unsupported;
  return (
    <p role="status" className="max-w-2xl text-caption text-muted-foreground">
      {text}
    </p>
  );
}

function ExpectedFiles({ copy }: { copy: DashboardCopy }) {
  return (
    <aside className="min-w-0 space-y-5 rounded-xl bg-muted/50 p-5">
      <h3 className="text-body font-medium">{copy.filesTitle}</h3>
      <dl className="space-y-4 text-caption">
        <div>
          <dt className="font-mono font-medium">pipeline.yml</dt>
          <dd className="mt-1 text-muted-foreground">{copy.pipelineFile}</dd>
        </div>
        <div>
          <dt className="font-mono font-medium">events.jsonl</dt>
          <dd className="mt-1 text-muted-foreground">{copy.eventsFile}</dd>
        </div>
      </dl>
    </aside>
  );
}

export function DashboardEntry({ children, copy }: { children: ReactNode; copy: DashboardCopy }) {
  return (
    <section className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-border bg-card p-6 wrap-anywhere sm:p-8 lg:grid-cols-2">
      <div className="min-w-0 space-y-5">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background text-primary">
          <FolderOpen aria-hidden="true" className="size-6" />
        </div>
        <h2 className="text-body font-semibold">{copy.emptyTitle}</h2>
        <p className="max-w-md text-body text-muted-foreground">{copy.emptyBody}</p>
        {children}
      </div>
      <ExpectedFiles copy={copy} />
    </section>
  );
}

export function PrivacyNote({ copy }: { copy: DashboardCopy }) {
  return (
    <div className="space-y-2 text-caption text-muted-foreground">
      <p className="flex items-center gap-2">
        <LockKeyhole aria-hidden="true" className="size-4" />
        {copy.privacy}
      </p>
      <p>{copy.reload}</p>
    </div>
  );
}
