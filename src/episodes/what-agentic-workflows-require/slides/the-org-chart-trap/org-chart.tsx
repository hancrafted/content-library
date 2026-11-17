import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export interface Role {
  readonly slug: string;
  readonly label: string;
  readonly people: number;
  readonly count: string;
  readonly focus?: boolean;
}

function Person() {
  return <span data-person className="size-5 rounded-full border-2 border-human bg-human/15" />;
}

function Connector() {
  return (
    <svg viewBox="0 0 300 40" preserveAspectRatio="none" className="h-8 w-full" aria-hidden="true">
      <path
        d="M150 0 V16 M50 16 H250 M50 16 V40 M150 16 V40 M250 16 V40"
        className="fill-none stroke-border"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function RoleBox({ role }: { role: Role }) {
  const focus = role.focus === true;
  return (
    <li
      data-role={role.slug}
      className={cn(
        'card-hover card-hover--outline flex flex-col items-center gap-2 rounded-md border p-2',
        focus ? 'border-primary' : 'border-border',
      )}
    >
      <span data-role-label className="text-center text-caption font-semibold">
        {role.label}
      </span>
      <span className={cn('grid gap-1', role.people > 1 && 'grid-cols-2')} aria-hidden="true">
        {Array.from({ length: role.people }, (_, at) => (
          <Person key={at} />
        ))}
      </span>
      <span className={cn('text-caption', focus ? 'font-semibold text-primary' : 'text-muted-foreground')}>
        {role.count}
      </span>
    </li>
  );
}

/**
 * The party committee as an org chart: its lead over three roles, each drawn with one disc per person, so the venue
 * scouts' ten read against the caterer's and the travel planner's one.
 */
export function OrgChart({ label, lead, roles }: { label: ReactNode; lead: string; roles: readonly Role[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="flex items-center gap-2 text-caption font-semibold text-muted-foreground uppercase">{label}</p>
      <div className="flex flex-col items-center rounded-lg bg-card p-4 shadow-md">
        <span
          data-org-lead
          className="rounded-md border border-border bg-background px-3 py-1 text-caption font-semibold"
        >
          {lead}
        </span>
        <Connector />
        <ul className="grid w-full grid-cols-3 items-start gap-3">
          {roles.map((role) => (
            <RoleBox key={role.slug} role={role} />
          ))}
        </ul>
      </div>
    </div>
  );
}
