import { describe, expect, it } from 'vitest';
import type { Ticket } from '../handoff.pure';
import { projectTicketGraph } from './ticket-graph.pure';

const t = (id: string, blockedBy: string[] = []): Ticket => ({ id, title: id, acceptance: [], blockedBy });
const PARTY = [
  t('shortlist'),
  t('access', ['shortlist']),
  t('menu', ['shortlist']),
  t('price', ['shortlist']),
  t('rank', ['access', 'menu', 'price']),
];
const statuses = (ticked: string[]) =>
  Object.fromEntries(projectTicketGraph(PARTY, ticked).nodes.map((node) => [node.ticket.id, node.status]));

describe('success cases', () => {
  it('puts each ticket one layer after its deepest blocker', () => {
    // ARRANGE
    const expected = [['shortlist'], ['access', 'menu', 'price'], ['rank']];
    // ACT
    const { layers } = projectTicketGraph(PARTY, []);
    // ASSERT
    expect(layers.map((layer) => layer.map((node) => node.ticket.id))).toEqual(expected);
  });

  it('runs edges from each blocker to the ticket it blocks', () => {
    // ARRANGE
    const expected = [
      'shortlist>access',
      'shortlist>menu',
      'shortlist>price',
      'access>rank',
      'menu>rank',
      'price>rank',
    ];
    // ACT
    const { edges } = projectTicketGraph(PARTY, []);
    // ASSERT
    expect(edges.map((edge) => `${edge.from}>${edge.to}`)).toEqual(expected);
  });

  it('readies the dependents once their blocker is ticked', () => {
    // ARRANGE
    const ticked = ['shortlist'];
    // ACT
    const result = statuses(ticked);
    // ASSERT
    expect(result).toEqual({ shortlist: 'done', access: 'ready', menu: 'ready', price: 'ready', rank: 'blocked' });
  });

  it('opens the edges of a done blocker and counts done tickets', () => {
    // ARRANGE
    const ticked = ['shortlist', 'menu'];
    const expectedDone = ticked.length;
    // ACT
    const graph = projectTicketGraph(PARTY, ticked);
    // ASSERT
    expect(graph.doneCount).toBe(expectedDone);
    expect(graph.edges.filter((edge) => edge.open).map((edge) => edge.from)).toEqual([
      'shortlist',
      'shortlist',
      'shortlist',
      'menu',
    ]);
  });

  it('places layers left to right inside the box', () => {
    // ARRANGE
    const x = (id: string, nodes: ReturnType<typeof projectTicketGraph>['nodes']) =>
      nodes.find((n) => n.ticket.id === id)?.x ?? Number.NaN;
    // ACT
    const { nodes, width, height } = projectTicketGraph(PARTY, []);
    // ASSERT
    expect(x('shortlist', nodes)).toBeLessThan(x('access', nodes));
    expect(x('access', nodes)).toBeLessThan(x('rank', nodes));
    for (const n of nodes) {
      expect(n.x + n.w).toBeLessThanOrEqual(width);
      expect(n.y + n.h).toBeLessThanOrEqual(height);
    }
  });
});

describe('failure cases', () => {
  it('starts with only the unblocked ticket ready', () => {
    // ARRANGE
    const ticked: string[] = [];
    // ACT
    const result = statuses(ticked);
    // ASSERT
    expect(result).toEqual({
      shortlist: 'ready',
      access: 'blocked',
      menu: 'blocked',
      price: 'blocked',
      rank: 'blocked',
    });
  });

  it('keeps a ticket blocked until all its blockers are done', () => {
    // ARRANGE
    const some = ['shortlist', 'access', 'menu'];
    // ACT
    const result = statuses(some).rank;
    // ASSERT
    expect(result).toBe('blocked');
    expect(statuses([...some, 'price']).rank).toBe('ready');
  });
});

describe('edge cases', () => {
  it('does not loop on a cycle', () => {
    // ARRANGE
    const tickets = [t('a', ['b']), t('b', ['a'])];
    const expected = tickets.length;
    // ACT
    const { nodes } = projectTicketGraph(tickets, []);
    // ASSERT
    expect(nodes).toHaveLength(expected);
  });

  it('draws nothing for no tickets', () => {
    // ARRANGE
    const tickets: Ticket[] = [];
    // ACT
    const graph = projectTicketGraph(tickets, []);
    // ASSERT
    expect(graph).toMatchObject({ nodes: [], edges: [], width: 0, height: 0 });
  });
});
