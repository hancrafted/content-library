'use client';

import { Button } from '@/components/ui/button';
import { fillTemplate } from '@/lib/template.pure';
import { useDashboardLogDialog } from '@/pipeline/hooks/use-dashboard-log-dialog';
import { selectEvents, type DashboardEvent, type EventScope } from '@/pipeline/lib/dashboard-events.pure';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import type { RunLogLine } from '../lib/run-log.schema.pure';
import type { DashboardCopy } from './dashboard-evidence';

function EventSummary({ line }: { line: RunLogLine }) {
  return (
    <>
      <p className="font-medium wrap-anywhere">{line.description ?? line.name ?? line.span_id}</p>
      <p className="text-muted-foreground wrap-anywhere">
        {line.job} {line.role} {line.source}
      </p>
      <p className="whitespace-pre-wrap wrap-anywhere">{line.rubric}</p>
      <p className="whitespace-pre-wrap wrap-anywhere">{line.summary ?? line.body ?? line.comment}</p>
    </>
  );
}

function EventStamp({ event, copy }: { event: DashboardEvent; copy: DashboardCopy }) {
  const { line } = event;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
      <span className="text-muted-foreground">{fillTemplate(copy.graph.sourceLine, { number: event.number })}</span>
      {line ? (
        <>
          <time dateTime={line.t}>{line.t}</time>
          <span className="font-semibold">{line.kind}</span>
          <span>{line.status ?? line.value}</span>
        </>
      ) : (
        <span className="text-destructive">{event.error}</span>
      )}
    </div>
  );
}

function EventRow({ event, copy }: { event: DashboardEvent; copy: DashboardCopy }) {
  return (
    <li className="space-y-2 border-b border-border py-4 text-caption">
      <EventStamp event={event} copy={copy} />
      {event.line ? <EventSummary line={event.line} /> : null}
      <details>
        <summary className="cursor-pointer py-2 font-medium focus-visible:outline-2 focus-visible:outline-ring">
          {copy.graph.raw}
        </summary>
        <pre className="mt-2 rounded-lg bg-muted p-3 text-caption whitespace-pre-wrap wrap-anywhere">{event.raw}</pre>
      </details>
    </li>
  );
}

type Modal = ReturnType<typeof useDashboardLogDialog>;
interface LogProps {
  events: readonly DashboardEvent[];
  scope: EventScope;
  title: string;
  copy: DashboardCopy;
  onDismiss: () => void;
}
interface HeaderProps {
  modal: Modal;
  title: string;
  count: number;
  copy: DashboardCopy;
}

function LogControls({ modal, count, copy }: Omit<HeaderProps, 'title'>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-caption">
      <span role="status">{fillTemplate(copy.graph.eventsCount, { count })}</span>
      <label className="flex min-h-11 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={modal.follow}
          onChange={(event) => modal.setFollow(event.target.checked)}
          className="size-4 accent-primary"
        />
        {copy.graph.follow}
      </label>
      <details>
        <summary className="cursor-pointer py-1 focus-visible:outline-2 focus-visible:outline-ring">
          {copy.graph.legend}
        </summary>
        <p className="pt-2 text-muted-foreground">
          {copy.graph.eventLegend} {copy.graph.followHelp}
        </p>
      </details>
    </div>
  );
}

function LogHeader({ modal, title, count, copy }: HeaderProps) {
  return (
    <header className="space-y-3 border-b border-border p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 id="dashboard-log-title" className="min-w-0 text-body font-semibold wrap-anywhere">
          {fillTemplate(copy.graph.eventTitle, { name: title })}
        </h2>
        <Button variant="outline" onClick={modal.close} aria-label={copy.graph.close} className="size-11 shrink-0">
          <X aria-hidden="true" className="size-5" />
        </Button>
      </div>
      <p id="dashboard-log-privacy" className="text-caption text-muted-foreground">
        {copy.graph.localLog}
      </p>
      <LogControls modal={modal} count={count} copy={copy} />
    </header>
  );
}

function LogBody({ modal, events, copy }: { modal: Modal; events: DashboardEvent[]; copy: DashboardCopy }) {
  return (
    <div
      ref={modal.scroll}
      onScroll={modal.onScroll}
      onWheel={(event) => {
        if (event.deltaY < 0) modal.setFollow(false);
      }}
      onKeyDown={(event) => {
        if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) modal.setFollow(false);
      }}
      tabIndex={0}
      role="region"
      aria-label={copy.graph.logs}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6"
    >
      {events.length > 0 ? (
        <ol>
          {events.map((event) => (
            <EventRow key={event.number} event={event} copy={copy} />
          ))}
        </ol>
      ) : (
        <p className="py-8 text-body text-muted-foreground">{copy.graph.emptyLog}</p>
      )}
    </div>
  );
}

export function DashboardLog({ events, scope, title, copy, onDismiss }: LogProps) {
  const selected = useMemo(() => selectEvents(events, scope), [events, scope]);
  const modal = useDashboardLogDialog(selected.length);
  return (
    <dialog
      ref={modal.dialog}
      onClose={(event) => {
        if (!event.currentTarget.open) onDismiss();
      }}
      aria-labelledby="dashboard-log-title"
      aria-describedby="dashboard-log-privacy"
      className="fixed inset-0 m-auto h-[90dvh] max-h-none w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-overlay/60"
    >
      <div className="flex h-full min-h-0 flex-col">
        <LogHeader modal={modal} title={title} count={selected.length} copy={copy} />
        <LogBody modal={modal} events={selected} copy={copy} />
      </div>
    </dialog>
  );
}
