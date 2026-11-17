// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { RoleCardView, rowsAt, type CartoonCardProps } from './cartoon-card-view';
import { CustomerCardView, type CustomerCardProps } from './customer-card-view';
import { CustomerDashboard, type CustomerDashboardProps } from './customer-dashboard.client';
import styles from './software-ecology.module.css';
import { StationCardView, type StationCardProps } from './station-card-view';
import { WorkCenterDashboard, type WorkCenterDashboardProps } from './work-center-dashboard.client';

type CardView = 'role' | 'station' | 'dashboard';

interface Opens {
  readonly id: string;
  readonly label: string;
  readonly onOpen?: (id: string, shift: boolean) => void;
}

export type WorkCenterCardProps =
  | {
      readonly cardView: 'role';
      readonly id: string;
      readonly kind: 'role' | 'customer';
      readonly cell: readonly [number, number];
      readonly target?: TargetProps;
      readonly stationTargets?: readonly TargetProps[];
      readonly cartoon: CartoonCardProps;
    }
  | (Opens & { readonly cardView: 'station'; readonly kind: 'role'; readonly station: StationCardProps })
  | (Opens & { readonly cardView: 'station'; readonly kind: 'customer'; readonly customer: CustomerCardProps })
  | { readonly cardView: 'dashboard'; readonly kind: 'role'; readonly dashboard: WorkCenterDashboardProps }
  | { readonly cardView: 'dashboard'; readonly kind: 'customer'; readonly dashboard: CustomerDashboardProps };

type PanelProps = Extract<WorkCenterCardProps, { cardView: Exclude<CardView, 'role'> }>;

function Panel(p: PanelProps) {
  if (p.cardView === 'dashboard')
    return p.kind === 'customer' ? <CustomerDashboard {...p.dashboard} /> : <WorkCenterDashboard {...p.dashboard} />;
  return p.kind === 'customer' ? (
    <CustomerCardView {...p.customer} label={p.label} />
  ) : (
    <StationCardView {...p.station} label={p.label} />
  );
}

export function WorkCenterCard(p: WorkCenterCardProps) {
  if (p.cardView === 'dashboard' || p.cardView === 'station') return <Panel {...p} />;
  return (
    <div
      className={styles.cartoon}
      data-card-view={p.cardView}
      data-id={p.id}
      data-kind={p.kind}
      data-control={`node.${p.id}`}
      style={rowsAt(p.cell)}
      {...p.target}
    >
      <RoleCardView {...p.cartoon} />
      {p.stationTargets?.map((t) => (
        <span key={t['data-target']} className={styles.spotFill} {...t} />
      ))}
    </div>
  );
}
