import { OversightPill } from '@/episodes/components/slide-shared/oversight-pill/oversight-pill';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';

/** How far a person steps out of the loop for a task. */
export type Level = 'in' | 'on' | 'out';

type RoleIcon = 'gate' | 'eye' | 'log';

/** The role's icon: a gate for the gatekeeper, an eye for the pilot, a log under a lens for the auditor. */
function RoleGlyph({ icon }: { icon: RoleIcon }) {
  return (
    <svg viewBox="0 0 40 40" className="w-10 shrink-0" aria-hidden="true">
      {icon === 'gate' && (
        <>
          <path d="M13 3H27L37 13V27L27 37H13L3 27V13Z" className="fill-none stroke-foreground" strokeWidth={3} />
          <path d="M12 20H28" className="fill-none stroke-foreground" strokeWidth={3} />
        </>
      )}
      {icon === 'eye' && (
        <>
          <path d="M3 20C10 8 30 8 37 20C30 32 10 32 3 20Z" className="fill-none stroke-foreground" strokeWidth={3} />
          <circle cx={20} cy={20} r={5} className="fill-foreground" />
        </>
      )}
      {icon === 'log' && (
        <>
          <path
            d="M6 4H26V36H6ZM10 12H22M10 18H22M10 24H18"
            className="fill-none stroke-foreground"
            strokeWidth={2.5}
          />
          <circle cx={28} cy={27} r={6} className="fill-card stroke-foreground" strokeWidth={2.5} />
          <path d="M32 31L37 36" className="fill-none stroke-foreground" strokeWidth={3} />
        </>
      )}
    </svg>
  );
}

export interface LevelCardProps {
  readonly level: Level;
  readonly label: string;
  readonly name: string;
  readonly abbr: string;
  readonly definition: string;
  readonly role: { readonly name: string; readonly does: string; readonly icon: RoleIcon };
  /** A Context marker beside the level's name. */
  readonly marker?: ReactNode;
  readonly targetProps?: TargetProps;
}

/**
 * One level of human oversight as a card: its shared pill, its full name with the abbreviation beside it, its
 * definition, and its role under a divider. The card spans the three rows `LevelGrid` shares, so the divider sits at
 * one height across the cards.
 */
export function LevelCard({ level, label, name, abbr, definition, role, marker, targetProps }: LevelCardProps) {
  return (
    <li
      data-level-card={level}
      {...targetProps}
      className="focus-group__item card-hover card-hover--raise row-span-3 grid grid-rows-subgrid gap-y-4 rounded-lg bg-card p-5 shadow-md"
    >
      <div className="flex flex-col items-start gap-2">
        <OversightPill label={label} />
        <p className="flex items-center gap-1 text-body">
          <span data-level-name>
            <b className="font-semibold">{name}</b> <span className="text-muted-foreground">· {abbr}</span>
          </span>
          {marker}
        </p>
      </div>
      <p className="text-body">{definition}</p>
      <div className="flex items-center gap-3 border-t border-border pt-3">
        <RoleGlyph icon={role.icon} />
        <div>
          <p data-role-name className="text-body font-semibold">
            {role.name}
          </p>
          <p className="text-caption text-muted-foreground">{role.does}</p>
        </div>
      </div>
    </li>
  );
}

/** The level cards side by side over one row grid (name, definition, role), stacked where the Slide is narrow. */
export function LevelGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ol
      aria-label={label}
      className="focus-group focus-group--dim-others grid grid-cols-1 gap-x-6 gap-y-4 @3xl:grid-cols-3"
    >
      {children}
    </ol>
  );
}
