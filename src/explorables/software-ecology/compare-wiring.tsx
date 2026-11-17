// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import type { RefObject } from 'react';
import { CompareStream } from './compare-stream.client';
import type { CompareWidgetProps } from './compare-widget';
import { CenterPanel } from './open-dashboard.client';
import type { Words } from './software-ecology-words.types';
import type { ViewId } from './software-ecology.types';
import type { WordsIn } from './use-case-words.pure.ts';
import type { CompareActions } from './use-compare.ts';
import type { DashboardState } from './use-dashboard.ts';
import type { FactoryView } from './use-factory.ts';

export interface CompareParts {
  readonly view: ViewId;
  readonly dash: DashboardState;
  readonly compare: CompareActions;
  readonly streamRoot: RefObject<HTMLElement | null>;
}

export const compareWidgetOf = (x: {
  words: Words;
  compare: CompareActions;
  dash: DashboardState;
  f: FactoryView;
  titles: Readonly<Record<string, string>>;
}): CompareWidgetProps => {
  const c = x.compare,
    icon = (id: string) => {
      const n = x.f.run.topology.nodes.get(id);
      return n ? (n.role.icon ?? n.roleId) : id;
    };
  return {
    words: x.words.compare,
    state: c.state,
    slots: c.state.ids.map((id) => ({ id, title: x.titles[id] ?? id, icon: icon(id) })),
    onToggle: c.toggle,
    onRemove: c.remove,
    onShow: () => (x.dash.dismiss(), c.show()),
    onExit: c.exit,
  };
};

const picks = (x: CompareParts, f: FactoryView, x2: { id: string; shift: boolean }): boolean => {
  const c = x.compare,
    picking = c.state.picking;
  if (!(picking || x2.shift) || f.run.topology.nodes.get(x2.id)?.kind !== 'role') return false;
  if (!picking) x.dash.dismiss();
  c.pick(x2.id);
  return true;
};

export const cardClick =
  (x: CompareParts, x2: { f: FactoryView }) =>
  (id: string, shift: boolean): void => {
    if (x.view !== 'factory') return;
    if (!picks(x, x2.f, { id, shift }) && !x.compare.state.picking) x.dash.toggle(id);
  };

export function Stream({ words, x, f, w }: { words: Words; x: CompareParts; f: FactoryView; w: WordsIn }) {
  return (
    <CompareStream
      topo={f.run.topology}
      layout={f.layout}
      ids={x.compare.stream}
      w={w}
      words={words.compare}
      card={words.card}
      stations={f.snap.stations}
      columns={f.snap.columns}
      belts={f.snap.belts}
      dashboard={(id) => <CenterPanel f={f} dash={x.dash} words={words} w={w} id={id} closable={false} />}
      onExit={x.compare.exit}
      root={x.streamRoot}
    />
  );
}
