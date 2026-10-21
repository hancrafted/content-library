'use client';

import type { Ticket } from '../handoff.pure';
import type { OutputWords } from './output-words';
import { projectTicketGraph, type GraphNode, type TicketStatus } from './ticket-graph.pure';

export interface TicketGraphProps {
  readonly tickets: readonly Ticket[];
  /** Ids of the tickets ticked off; the parent owns this. */
  readonly ticked: readonly string[];
  readonly onTick: (id: string) => void;
  readonly words: OutputWords;
}

const NODE_STYLE: Readonly<Record<TicketStatus, string>> = {
  done: 'border-(--success) bg-(--success)/10 text-foreground',
  ready: 'border-ai bg-card text-card-foreground shadow-md shadow-ai/20 hover:-translate-y-0.5 hover:shadow-lg',
  blocked: 'border-dashed border-border bg-muted/60 text-muted-foreground',
};

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-4 fill-none stroke-current stroke-2">
      <path d="M3 8.5l3.2 3.2L13 4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function path(from: GraphNode, to: GraphNode): string {
  const x1 = from.x + from.w;
  const y1 = from.y + from.h / 2;
  const x2 = to.x;
  const y2 = to.y + to.h / 2;
  const mid = (x1 + x2) / 2;
  return `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`;
}

type Graph = ReturnType<typeof projectTicketGraph>;

/** A node's box as percentages of the graph's, so it scales with the edges. */
function place(node: GraphNode, graph: Graph) {
  const pct = (part: number, whole: number) => `${(part / whole) * 100}%`;
  return {
    left: pct(node.x, graph.width),
    top: pct(node.y, graph.height),
    width: pct(node.w, graph.width),
    height: pct(node.h, graph.height),
  };
}

function Edges({ graph }: { graph: Graph }) {
  const at = new Map(graph.nodes.map((node) => [node.ticket.id, node]));
  return (
    <svg
      viewBox={`0 0 ${graph.width} ${graph.height}`}
      preserveAspectRatio="none"
      aria-hidden
      className="absolute inset-0 size-full overflow-visible fill-none"
    >
      {graph.edges.map((edge) => {
        const from = at.get(edge.from);
        const to = at.get(edge.to);
        if (!from || !to) return null;
        return (
          <path
            key={`${edge.from}>${edge.to}`}
            data-edge={`${edge.from}>${edge.to}`}
            data-open={edge.open}
            d={path(from, to)}
            vectorEffect="non-scaling-stroke"
            strokeWidth={2}
            className={`transition-colors duration-300 ${edge.open ? 'stroke-(--success)' : 'stroke-border'}`}
          />
        );
      })}
    </svg>
  );
}

interface NodeProps {
  readonly node: GraphNode;
  readonly graph: Graph;
  readonly onTick: (id: string) => void;
  readonly words: OutputWords;
}

function NodeButton({ node, graph, onTick, words }: NodeProps) {
  const { blockedBy } = node.ticket;
  return (
    <button
      type="button"
      data-ticket={node.ticket.id}
      data-status={node.status}
      aria-pressed={node.status === 'done'}
      disabled={node.status === 'blocked'}
      onClick={() => onTick(node.ticket.id)}
      style={place(node, graph)}
      className={`absolute flex flex-col justify-between rounded-xl border-2 px-3 py-2 text-left transition-all duration-300 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:cursor-pointer ${NODE_STYLE[node.status]}`}
    >
      <span className="text-body leading-snug font-semibold">{node.ticket.title}</span>
      <span className="flex items-center gap-1.5 text-caption font-medium">
        {node.status === 'done' ? <Check /> : null}
        {words[node.status]}
        {blockedBy.length > 0 ? (
          <span className="truncate font-normal text-muted-foreground">
            · {words.blockedBy} {blockedBy.join(', ')}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function Acceptance({ tickets, words }: { tickets: readonly Ticket[]; words: OutputWords }) {
  return (
    <ul className="grid gap-2 @2xl:grid-cols-2">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="rounded-lg bg-muted px-3 py-2">
          <p className="text-caption font-semibold text-foreground">{ticket.title}</p>
          <p className="text-caption text-muted-foreground">
            {words.acceptance}: {ticket.acceptance.join('; ')}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** The ticket dependency graph: layers left to right, curved edges, click a ready ticket to tick it and ready its dependents. */
export function TicketGraph({ tickets, ticked, onTick, words }: TicketGraphProps) {
  const graph = projectTicketGraph(tickets, ticked);
  const progress = words.progress
    .replace('{done}', String(graph.doneCount))
    .replace('{total}', String(graph.nodes.length));
  return (
    <section data-output="tickets" aria-label={words.tickets} className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption text-muted-foreground">{words.graphHint}</p>
        <p data-progress className="text-caption font-semibold text-foreground" aria-live="polite">
          {progress}
        </p>
      </header>
      <div className="overflow-x-auto rounded-xl border border-border bg-background p-4">
        <div
          className="relative mx-auto"
          style={{ aspectRatio: `${graph.width} / ${graph.height}`, minWidth: graph.width, maxWidth: graph.width }}
        >
          <Edges graph={graph} />
          {graph.nodes.map((node) => (
            <NodeButton key={node.ticket.id} node={node} graph={graph} onTick={onTick} words={words} />
          ))}
        </div>
      </div>
      <Acceptance tickets={tickets} words={words} />
    </section>
  );
}
