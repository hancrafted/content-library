/*
 * The stage's fixed parts for one run, in words: each card's box, title, glyph and possible signs, and each belt's
 * label and where it sits. Computed once a run; the readouts that change come from the snapshot.
 */
import { fillTemplate } from '@/shared/lib/template.pure';
import { placeLabels, type LabelPlace } from './factory-labels.pure.ts';
import { boxOf, type FactoryLayout } from './factory-layout.pure.ts';
import type { BeltReadout, TopoNode, Topology } from './factory-model.pure.ts';
import type { StageWords } from './software-ecology-words.types';
import type { SignKind } from './stage-readouts.pure.ts';
import { beltWords, centerTitle, customerTitle, type WordsIn } from './use-case-words.pure.ts';

export interface CardPart {
  readonly id: string;
  readonly box: readonly [number, number, number, number];
  readonly title: string;
  readonly icon: string;
  readonly inspection: boolean;
  readonly signs: readonly SignKind[];
}

export interface BeltPart {
  readonly key: string;
  readonly at: LabelPlace;
  readonly label: string;
  readonly back: string;
}

/** Centers a complaint can reach: named in the Customer's or any preset's `bad` chances. */
const complaintsTo = (topo: Topology): Set<string> =>
  new Set(
    [topo.B.data.customer, ...topo.B.data.presets.map((p) => p.customer ?? {})].flatMap((c) =>
      Object.keys(c.bad ?? {}),
    ),
  );

const signsOf = (n: TopoNode, compl: Set<string>): SignKind[] =>
  (['rework', 'churn', 'unread', 'complaint'] as const).filter(
    (k) => (k !== 'unread' || !!n.def.inspection) && (k !== 'complaint' || compl.has(n.id)),
  );

export const cardsOf = (m: Topology, w: WordsIn): CardPart[] => {
  const compl = complaintsTo(m);
  return m.centers.map((n) => ({
    id: n.id,
    box: boxOf(n.def),
    title: centerTitle(w, { id: n.id, role: n.roleId }),
    icon: n.role.icon ?? n.roleId,
    inspection: !!n.def.inspection,
    signs: signsOf(n, compl),
  }));
};

export const customerCardOf = (m: Topology, w: WordsIn) => ({ box: boxOf(m.cust.def), title: customerTitle(w) });

export const beltsOf = (x: { topo: Topology; layout: FactoryLayout; w: WordsIn; stage: StageWords }): BeltPart[] => {
  const words = Object.fromEntries(x.layout.order.map((k) => [k, beltWords(x.w, k, x.stage.sentBack)]));
  const text = (k: string) => `${words[k]?.label ?? ''} · 12 a week · ↩ ${words[k]?.back ?? ''}`;
  const at = placeLabels(
    x.layout,
    [...x.topo.nodes.values()].map((n) => n.def),
    text,
  );
  return x.layout.order.map((k) => ({
    key: k,
    at: at[k] as LabelPlace,
    label: words[k]?.label ?? '',
    back: words[k]?.back ?? '',
  }));
};

/** A belt's rates on its label: "· 12 a week · ↩ 3 changes requested". */
export const rateText = (b: BeltPart, r: BeltReadout | undefined, stage: StageWords): string => {
  const back = Math.round(r?.back ?? 0);
  const week = `· ${fillTemplate(stage.aWeek, { n: Math.round(r?.rate ?? 0) })}`;
  return back ? `${week} · ${fillTemplate(stage.back, { n: back, what: b.back })}` : week;
};
