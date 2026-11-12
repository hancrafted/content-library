/*
 * Swing and Roles in words, once a run: every node's card at its grid cell (the cartoon panel, caption, job and
 * artefacts) and the tiles that fill the empty cells. The grid itself is `factory-grid.pure.ts`.
 */
import { fillTemplate } from '@/shared/lib/template.pure';
import { panelById, panelFor, type CartoonPanel } from './cartoon-panels.pure.ts';
import { gridOf, tilesOf, type Cell, type GridView } from './factory-grid.pure.ts';
import type { TopoNode, Topology } from './factory-model.pure.ts';
import type { CartoonWords } from './software-ecology-words.types';
import { centerTitle, customerJob, customerTitle, roleWords, type WordsIn } from './use-case-words.pure.ts';

export interface CartoonCardPart {
  readonly id: string;
  readonly kind: 'role' | 'customer';
  readonly cell: Cell;
  /** No cartoon panel: it sits out Swing. */
  readonly outOfSwing: boolean;
  readonly title: string;
  readonly icon: string;
  readonly panel?: CartoonPanel;
  readonly caption?: string;
  readonly job: string;
  readonly artefacts: readonly string[];
}

export interface TilePart {
  readonly id: string;
  readonly panel: CartoonPanel;
  readonly cell: Cell;
  readonly caption: string;
  readonly tag: string;
  readonly job?: string;
}

const cardOf = (x: { topo: Topology; w: WordsIn; words: CartoonWords; id: string }) => {
  const n = x.topo.nodes.get(x.id) as TopoNode,
    roleId = n.roleId;
  const panel = x.topo.B.data.panels ? panelFor(n) : undefined;
  return {
    panel,
    caption: panel ? x.words.captions[panel.id] : undefined,
    icon: n.role.icon ?? roleId,
    artefacts: roleWords(x.w, roleId).artefacts ?? [],
    ...(n.kind === 'customer'
      ? { kind: 'customer' as const, title: customerTitle(x.w), icon: 'customer', job: customerJob(x.w) }
      : {
          kind: 'role' as const,
          title: centerTitle(x.w, { id: x.id, role: roleId }),
          job: roleWords(x.w, roleId).job ?? '',
        }),
  };
};

/** Every node in flow order, the Customer first, as a Swing or Roles card. */
export const cartoonCardsOf = (m: Topology, w: WordsIn, words: CartoonWords): CartoonCardPart[] => {
  const g = gridOf(m);
  return m.order.map((id) => ({
    id,
    cell: g.at[id] ?? [1, 1],
    outOfSwing: g.outOfSwing.includes(id),
    ...cardOf({ topo: m, w, words, id }),
  }));
};

/** The tiles a view shows: Documentation and Billing, and in Swing what the customer really needed. */
export const tilePartsOf = (m: Topology, view: GridView, x: { w: WordsIn; words: CartoonWords }): TilePart[] =>
  tilesOf(m, view).map((t) => {
    const real = panelById(t.id) as CartoonPanel;
    const role = real.target ? customerTitle(x.w) : (roleWords(x.w, real.node ?? '').title ?? real.id);
    return {
      id: t.id,
      panel: real,
      cell: t.at,
      caption: x.words.captions[t.id] ?? '',
      tag: real.target ? role : fillTemplate(x.words.notHere, { role }),
      job: x.words.jobs[t.id],
    };
  });
