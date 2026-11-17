import type { ReactNode } from 'react';

export function DesignBracket(props: { readonly label: string; readonly hint: string; readonly marker: ReactNode }) {
  return (
    <div data-design-bracket="" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span
          data-design-label=""
          className="rounded-full bg-primary px-4 py-1 text-body font-semibold text-primary-foreground"
        >
          {props.label}
        </span>
        <span className="text-caption text-foreground">{props.hint}</span>
        {props.marker}
      </div>
      <svg viewBox="0 0 1000 20" preserveAspectRatio="none" className="h-4 w-full" aria-hidden="true">
        <path
          d="M3 18 V4 H997 V18"
          className="fill-none stroke-primary"
          strokeWidth={3}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
