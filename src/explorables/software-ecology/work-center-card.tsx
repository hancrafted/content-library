import type { TargetProps } from '@/shared/lib/context-link.pure';
import { RoleCardView, rowsAt, type CartoonCardProps } from './cartoon-card-view';
import { CustomerCardView, type CustomerCardProps } from './customer-card-view';
import { CustomerDashboard, type CustomerDashboardProps } from './customer-dashboard.client';
import styles from './software-ecology.module.css';
import { StationCardView, type StationCardProps } from './station-card-view';
import { WorkCenterDashboard, type WorkCenterDashboardProps } from './work-center-dashboard.client';

/*
 * One card per work center, and the Customer, in every view (design-ADR 0024 §13): `cardView` picks the role with its
 * cartoon panel (`role`, not clickable since feedback 09), the station on the line (`station`) or its dashboard (`dashboard`), which the popover
 * and the compare stream's columns show. Every floor view keeps the card's id on its root, so a view change keeps one
 * card's identity.
 */

type CardView = 'role' | 'station' | 'dashboard';

interface Opens {
  readonly id: string;
  /** "{title}: open its dashboard", the card's name as a button. */
  readonly label: string;
  /** A click or Enter/Space on the card; `shift` for a compare pick. */
  readonly onOpen?: (id: string, shift: boolean) => void;
}

export type WorkCenterCardProps =
  | {
      readonly cardView: 'role';
      readonly id: string;
      readonly kind: 'role' | 'customer';
      readonly cell: readonly [number, number];
      /** A Slide's Context target on the card. */
      readonly target?: TargetProps;
      /** Targets the station places on its rack or a sign; here they cover the card, so a note still lights it. */
      readonly stationTargets?: readonly TargetProps[];
      readonly cartoon: CartoonCardProps;
    }
  | (Opens & { readonly cardView: 'station'; readonly kind: 'role'; readonly station: StationCardProps })
  | (Opens & { readonly cardView: 'station'; readonly kind: 'customer'; readonly customer: CustomerCardProps })
  | { readonly cardView: 'dashboard'; readonly kind: 'role'; readonly dashboard: WorkCenterDashboardProps }
  | { readonly cardView: 'dashboard'; readonly kind: 'customer'; readonly dashboard: CustomerDashboardProps };

type PanelProps = Extract<WorkCenterCardProps, { cardView: Exclude<CardView, 'role'> }>;

/** The views that are not on the cartoon grid: the station on the line and the dashboard. */
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
