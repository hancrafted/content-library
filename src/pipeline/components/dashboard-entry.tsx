import { Button } from '@/shared/components/ui/button';
import { FolderOpen, LockKeyhole, Play } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DashboardCopy } from './dashboard-evidence';

export function ChooseFolder({
  choose,
  choosing,
  supported,
  copy,
  variant,
}: {
  choose: () => void;
  choosing: boolean;
  supported: boolean | null;
  copy: DashboardCopy;
  variant?: 'outline';
}) {
  return (
    <Button
      type="button"
      variant={variant}
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

/** Replays the recorded Run under public/dashboard-demo/; it needs no folder access, so every browser can open it. */
export function OpenDemo({ open, choosing, copy }: { open: () => void; choosing: boolean; copy: DashboardCopy }) {
  return (
    <Button
      type="button"
      onClick={open}
      disabled={choosing}
      data-testid="dashboard-demo"
      className="h-auto min-h-11 min-w-0 max-w-full cursor-pointer whitespace-normal"
    >
      <Play aria-hidden="true" />
      {copy.demo}
    </Button>
  );
}

/** Marks a replayed recording as a demo wherever its Run shows, so nobody reads it as live. */
export function DemoNotice({ copy }: { copy: DashboardCopy }) {
  return (
    <p
      role="note"
      data-testid="dashboard-demo-notice"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-caption text-foreground"
    >
      <span className="rounded-full bg-primary px-2.5 py-0.5 font-mono text-caption font-semibold uppercase tracking-wider text-primary-foreground">
        {copy.demoBadge}
      </span>
      <span className="min-w-0 flex-1">{copy.demoNote}</span>
    </p>
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
        <p className="max-w-lg text-body text-muted-foreground">{copy.emptyBody}</p>
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
