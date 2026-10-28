import type { ReactNode } from 'react';
import styles from './ai-disciplines.module.css';
import { DISCIPLINES, type Discipline } from './scene-frames.pure';

/** One icon per scale, from a single sheet to a building, growing with what the discipline compares to. */
const ICONS: Record<Discipline, ReactNode> = {
  prompting: (
    <svg viewBox="0 0 24 30" className="h-6 w-auto" aria-hidden="true">
      <rect x="4" y="3" width="16" height="22" rx="2" className="fill-none stroke-current" strokeWidth="2" />
      <path d="M8 10h8M8 14h8M8 18h5" className="stroke-current" strokeWidth="2" />
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 30" className="h-6 w-auto" aria-hidden="true">
      <circle cx="12" cy="9" r="5" className="fill-current" />
      <path d="M3 28c0-6 4-9 9-9s9 3 9 9z" className="fill-current" />
    </svg>
  ),
  workflows: (
    <svg viewBox="0 0 48 30" className="h-6 w-auto" aria-hidden="true">
      <circle cx="24" cy="8" r="5" className="fill-current" />
      <path d="M15 28c0-6 4-9 9-9s9 3 9 9z" className="fill-current" />
      <circle cx="9" cy="11" r="4" className="fill-current opacity-60" />
      <path d="M1 28c0-5 3-8 8-8s8 3 8 8z" className="fill-current opacity-60" />
      <circle cx="39" cy="11" r="4" className="fill-current opacity-60" />
      <path d="M31 28c0-5 3-8 8-8s8 3 8 8z" className="fill-current opacity-60" />
    </svg>
  ),
  factory: (
    <svg viewBox="0 0 40 30" className="h-6 w-auto" aria-hidden="true">
      <path
        d="M3 28V10l10-6v6l10-6v6l10-6v24z"
        className="fill-none stroke-current"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 18h4M16 18h4M24 18h4M8 23h4M16 23h4M24 23h4" className="stroke-current" strokeWidth="2" />
    </svg>
  ),
};

/**
 * The "comparable to" card above the cards (a pure view): one scale per discipline, in its column, its label at the top
 * left. A lit discipline's scale stays full, the others dim.
 */
export function ScaleRowView(props: {
  readonly label: string;
  readonly scales: Readonly<Record<Discipline, string>>;
  readonly lit: Discipline | null;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card pt-12 pb-3">
      <p className="absolute top-2.5 left-4 text-caption font-medium tracking-wide text-muted-foreground uppercase">
        {props.label}
      </p>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {DISCIPLINES.map((discipline) => (
          <li
            key={discipline}
            data-on={props.lit === discipline}
            className={`${styles[discipline]} flex flex-col items-center gap-0.5 text-body font-medium transition-opacity motion-reduce:transition-none ${props.lit !== null && props.lit !== discipline ? 'opacity-35' : ''}`}
          >
            <span className="text-(--tone)">{ICONS[discipline]}</span>
            {props.scales[discipline]}
          </li>
        ))}
      </ul>
    </div>
  );
}
