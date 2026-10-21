import type { Ticket } from '../handoff.pure';

/*
 * Pure projection of a `tickets` handoff into a layered dependency graph: layers by blockedBy depth, edges from blocker
 * to blocked, and each ticket's status from the ticked ids. Boxes are in abstract units; the view scales them.
 */

export type TicketStatus = 'done' | 'ready' | 'blocked';

export interface GraphNode {
  readonly ticket: Ticket;
  readonly layer: number;
  readonly status: TicketStatus;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface GraphEdge {
  readonly from: string;
  readonly to: string;
  /** The blocker is done, so this edge no longer holds the ticket back. */
  readonly open: boolean;
}

export interface TicketGraph {
  readonly layers: readonly (readonly GraphNode[])[];
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly doneCount: number;
  readonly width: number;
  readonly height: number;
}

const NODE_W = 220;
const NODE_H = 76;
const GAP_X = 72;
const GAP_Y = 20;

function layerOf(tickets: readonly Ticket[]): Map<string, number> {
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const depth = new Map<string, number>();
  const visiting = new Set<string>();
  const walk = (id: string): number => {
    const known = depth.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return -1;
    visiting.add(id);
    const blockers = (byId.get(id)?.blockedBy ?? []).filter((other) => byId.has(other));
    const value = blockers.length === 0 ? 0 : Math.max(...blockers.map(walk)) + 1;
    visiting.delete(id);
    depth.set(id, value);
    return value;
  };
  for (const ticket of tickets) walk(ticket.id);
  return depth;
}

export function projectTicketGraph(tickets: readonly Ticket[], ticked: readonly string[]): TicketGraph {
  const done = new Set(ticked);
  const depth = layerOf(tickets);
  const count = Math.max(0, ...[...depth.values()]) + 1;
  const grouped: Ticket[][] = Array.from({ length: tickets.length === 0 ? 0 : count }, () => []);
  for (const ticket of tickets) grouped[depth.get(ticket.id) ?? 0]?.push(ticket);
  const tallest = Math.max(0, ...grouped.map((layer) => layer.length));
  const height = tallest === 0 ? 0 : tallest * NODE_H + (tallest - 1) * GAP_Y;
  const width = grouped.length === 0 ? 0 : grouped.length * NODE_W + (grouped.length - 1) * GAP_X;

  const layers = grouped.map((layer, at) => {
    const used = layer.length * NODE_H + (layer.length - 1) * GAP_Y;
    return layer.map((ticket, row): GraphNode => ({
      ticket,
      layer: at,
      status: done.has(ticket.id) ? 'done' : ticket.blockedBy.every((other) => done.has(other)) ? 'ready' : 'blocked',
      x: at * (NODE_W + GAP_X),
      y: (height - used) / 2 + row * (NODE_H + GAP_Y),
      w: NODE_W,
      h: NODE_H,
    }));
  });
  const nodes = layers.flat();
  const edges = tickets.flatMap((ticket) =>
    ticket.blockedBy.map((from) => ({ from, to: ticket.id, open: done.has(from) })),
  );
  return { layers, nodes, edges, doneCount: nodes.filter((n) => n.status === 'done').length, width, height };
}
