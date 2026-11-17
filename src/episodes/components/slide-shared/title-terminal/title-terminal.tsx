import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export function TitleTerminal({
  title,
  ai = false,
  size = 'hero',
  children,
}: {
  title: string;
  ai?: boolean;
  size?: 'hero' | 'section';
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-2xl border bg-card shadow-sm',
        ai ? 'border-ai/40 ring-4 ring-ai/10' : 'border-border',
        size === 'section' && 'max-w-xl',
      )}
    >
      <TitleBar title={title} />
      <TermBody size={size}>{children}</TermBody>
    </div>
  );
}

export function TermLine({ prompt, command }: { prompt: string; command?: string }) {
  return (
    <span className="block">
      <span className="text-muted-foreground">{prompt} </span>
      {command ? (
        <span className="text-primary">{command}</span>
      ) : (
        <span className="inline-block h-4 w-2 bg-primary align-middle" aria-hidden="true" />
      )}
    </span>
  );
}

export function AgentReady({ ready, hint }: { ready: string; hint: string }) {
  return (
    <span className="block rounded-lg border border-ai/40 px-3 py-2 ring-4 ring-ai/15">
      <span className="block text-ai">{ready}</span>
      <span className="block text-caption text-muted-foreground">{hint}</span>
    </span>
  );
}

export function PermissionAsk({ question, yes }: { question: string; yes: string }) {
  return (
    <span className="block text-caption text-muted-foreground">
      {question} <span className="rounded bg-primary px-1.5 font-semibold text-primary-foreground">› {yes}</span>
    </span>
  );
}

export function LineTag({ children, ai = false }: { children: ReactNode; ai?: boolean }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full border bg-background px-2 py-0.5 font-sans text-caption',
        ai ? 'border-ai/40 text-ai' : 'border-border text-muted-foreground',
      )}
    >
      {children}
    </span>
  );
}

function TitleBar({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-2.5" aria-hidden="true">
      <span className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
      </span>
      <span className="truncate text-caption text-muted-foreground">{title}</span>
    </div>
  );
}

function TermBody({ size, children }: { size: 'hero' | 'section'; children: ReactNode }) {
  return (
    <div
      className={cn('flex flex-col gap-4 p-5 font-mono wrap-anywhere', size === 'hero' ? 'text-body' : 'text-caption')}
    >
      {children}
    </div>
  );
}
