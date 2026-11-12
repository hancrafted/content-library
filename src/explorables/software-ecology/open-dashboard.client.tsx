'use client';

import { useId, type ReactNode, type RefObject } from 'react';
import type { DialKey } from './dash-rows.pure.ts';
import { DashPopover } from './dashboard-popover.client';
import type { DashboardReadout } from './dashboard-readouts.pure.ts';
import type { TopoNode } from './factory-model.pure.ts';
import { withCustomer, withOver, withOwn } from './factory-settings.pure.ts';
import type { Words } from './software-ecology-words.types';
import { centerTitle, customerJob, customerTitle, roleWords, titlesOf, type WordsIn } from './use-case-words.pure.ts';
import type { DashboardState } from './use-dashboard.ts';
import type { FactoryView } from './use-factory.ts';
import { WorkCenterCard } from './work-center-card';
import type { WorkCenterDashboardProps } from './work-center-dashboard.client';

/*
 * The open dashboard in its popover: a work center's, or the Customer's. Every dial writes the run's settings
 * through `setSettings`; the readouts come from the snapshot, which covers the open card while it is open.
 */

export interface OpenDashboardProps {
  readonly f: FactoryView;
  readonly dash: DashboardState;
  readonly words: Words;
  readonly w: WordsIn;
  readonly wrap: RefObject<HTMLElement | null>;
  /** A Slide's Context markers by spot; a work center's `<id>:card` sits on its dashboard. */
  readonly markers?: Readonly<Partial<Record<string, ReactNode>>>;
}

function CustomerPanel(p: OpenDashboardProps & { titleId: string }) {
  const r = p.f.snap.customerDash,
    c = p.f.controls;
  if (!r) return null;
  return (
    <WorkCenterCard
      cardView="dashboard"
      kind="customer"
      dashboard={{
        title: customerTitle(p.w),
        job: customerJob(p.w),
        r,
        titles: titlesOf(p.w),
        words: p.words.custDash,
        rateTip: p.words.customer.rateTip,
        close: p.words.dash,
        titleId: p.titleId,
        onChange: (x) => c.setSettings(withCustomer(c.settings, r.cust, x)),
        onClose: p.dash.close,
      }}
    />
  );
}

type CenterIn = Pick<OpenDashboardProps, 'f' | 'dash' | 'words' | 'w' | 'markers'> & {
  id: string;
  titleId?: string;
  closable?: boolean;
};

const centerDash = (p: CenterIn, x: { n: TopoNode; r: DashboardReadout }): WorkCenterDashboardProps => {
  const c = p.f.controls;
  return {
    id: p.id,
    title: centerTitle(p.w, { id: x.n.id, role: x.n.roleId }),
    icon: x.n.role.icon ?? x.n.roleId,
    role: roleWords(p.w, x.n.roleId),
    r: x.r,
    help: p.dash.help,
    words: p.words.dash,
    titleId: p.titleId,
    onDial: (k: DialKey, v: number) => c.setSettings(withOver(c.settings, p.id, { [k]: v })),
    onAi: (on) => c.setSettings(withOver(c.settings, p.id, { ai: on })),
    onOwn: (id, patch) => c.setSettings(withOwn(c.settings, id, patch)),
    onEmit: () => c.emit(p.id),
    onHelp: p.dash.toggleHelp,
    onClose: p.closable === false ? undefined : p.dash.close,
    marker: p.markers?.[`${p.id}:card`],
  };
};

/** A work center's dashboard: in the popover with its close button, in a compare column without (`closable` false). */
export function CenterPanel(p: CenterIn) {
  const r = p.f.snap.dashboards[p.id],
    n = p.f.run.topology.nodes.get(p.id);
  if (!r || !n) return null;
  return <WorkCenterCard cardView="dashboard" kind="role" dashboard={centerDash(p, { n, r })} />;
}

/** Nothing while no dashboard is open, or until the snapshot first covers it. */
export function OpenDashboard(p: OpenDashboardProps) {
  const titleId = useId(),
    id = p.dash.open;
  const ready = id === 'customer' ? !!p.f.snap.customerDash : !!(id && p.f.snap.dashboards[id]);
  if (!id || !ready) return null;
  return (
    <DashPopover id={id} floor={p.f.floor} wrap={p.wrap} labelledBy={titleId}>
      {id === 'customer' ? (
        <CustomerPanel {...p} titleId={titleId} />
      ) : (
        <CenterPanel {...p} id={id} titleId={titleId} />
      )}
    </DashPopover>
  );
}
