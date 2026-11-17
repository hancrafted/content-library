import { OversightPill } from '@/episodes/components/slide-shared/oversight-pill/oversight-pill';
import { AgentTag } from '@/episodes/components/slide-shared/party-notes/agent-tag';
import { cn } from '@/shared/lib/utils';
import type { Level } from './level-card';

function DownArrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <path d="M12 3V19M6 13L12 20L18 13" className="fill-none stroke-foreground" strokeWidth={2.5} />
    </svg>
  );
}

export function ExampleTask({ card, task, label }: { card: string; task: string; label: string }) {
  return (
    <>
      <DownArrow />
      <span className="shrink-0 rounded-full bg-foreground px-3 py-1 text-caption whitespace-nowrap text-background uppercase">
        {label}
      </span>
      <p data-example-task className="text-body">
        <span className="text-muted-foreground">{card} ·</span> <b className="font-semibold">{task}</b>
      </p>
    </>
  );
}

const TILT: Record<Level, string> = { in: '-rotate-1', on: 'rotate-1', out: '-rotate-1' };

export function TaskExample({
  level,
  label,
  text,
  aside,
  agent,
}: {
  level: Level;
  label: string;
  text: string;
  aside: string;
  agent: string;
}) {
  return (
    <li
      data-task-example={level}
      className={cn('relative flex flex-col gap-1 rounded-md bg-card p-4 shadow-md', TILT[level])}
    >
      <AgentTag label={agent} />
      <OversightPill label={label} />
      <p data-example-text className="text-body font-semibold">
        {text}
      </p>
      <p className="text-caption text-muted-foreground">{aside}</p>
    </li>
  );
}
