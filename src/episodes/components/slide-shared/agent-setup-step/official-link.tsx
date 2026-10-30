import { externalHref } from '@/shared/lib/external-link.pure';
import { cn } from '@/shared/lib/utils';

/**
 * A link to the vendor's own page (Visual language "Official links"): a labelled pill with an external-link mark,
 * never a pasted URL. `filled` is the step's one thing to do; `outlined` leaves the `primary` fill to something else.
 */
export interface OfficialLinkProps {
  readonly label: string;
  readonly url: string;
  /** Said after the label to assistive tech: the link opens a new tab. */
  readonly newTab: string;
  readonly variant: 'filled' | 'outlined';
}

const VARIANT = {
  filled: 'bg-primary px-5 py-3 text-body text-primary-foreground shadow-sm',
  outlined: 'border border-primary px-4 py-2 text-caption text-primary',
} as const;

export function OfficialLink({ label, url, newTab, variant }: OfficialLinkProps) {
  return (
    <a
      href={externalHref(url)}
      target="_blank"
      rel="noopener noreferrer"
      data-official-link={variant}
      className={cn(
        'card-hover card-hover--raise inline-flex items-center gap-3 self-start rounded-full font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring',
        VARIANT[variant],
      )}
    >
      {label}
      <span className="sr-only"> ({newTab})</span>
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
        <path
          d="M6 3H3.5A.5.5 0 0 0 3 3.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10M9 3h4v4M13 3 7.5 8.5"
          className="fill-none stroke-current"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
