import { useId, type RefObject } from 'react';
import type { DialKey } from './dash-rows.pure.ts';
import { DashPopover } from './dashboard-popover.client';
import { withCustomer, withOver } from './factory-settings.pure.ts';
import type { Words } from './software-ecology-words.types';
import { centerTitle, customerJob, customerTitle, roleWords, titlesOf, type WordsIn } from './use-case-words.pure.ts';
import type { DashboardState } from './use-dashboard.ts';
import type { FactoryView } from './use-factory.ts';
import { WorkCenterCard } from './work-center-card';

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

/** A work center's dashboard: in the popover with its close button, in a compare column without (`closable` false). */
export function CenterPanel(
  p: Pick<OpenDashboardProps, 'f' | 'dash' | 'words' | 'w'> & { id: string; titleId?: string; closable?: boolean },
) {
  const r = p.f.snap.dashboards[p.id],
    n = p.f.run.m.nodes.get(p.id),
    c = p.f.controls;
  if (!r || !n) return null;
  return (
    <WorkCenterCard
      cardView="dashboard"
      kind="role"
      dashboard={{
        title: centerTitle(p.w, { id: n.id, role: n.roleId }),
        icon: n.role.icon ?? n.roleId,
        role: roleWords(p.w, n.roleId),
        r,
        help: p.dash.help,
        words: p.words.dash,
        titleId: p.titleId,
        onDial: (k: DialKey, v: number) => c.setSettings(withOver(c.settings, p.id, { [k]: v })),
        onAi: (on) => c.setSettings(withOver(c.settings, p.id, { ai: on })),
        onHelp: p.dash.toggleHelp,
        onClose: p.closable === false ? undefined : p.dash.close,
      }}
    />
  );
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
