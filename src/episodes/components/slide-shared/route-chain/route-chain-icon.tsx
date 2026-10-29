import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import type { Piece } from './route-chain.pure';

const ICON_PATHS: Readonly<Record<Piece | 'proof', ReactNode>> = {
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <path d="M7 10l3 2.5L7 15M12.5 15H17" />
    </>
  ),
  agent: (
    <>
      <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" />
      <path d="M18.5 16v4M16.5 18h4" />
    </>
  ),
  folder: <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />,
  skill: (
    <>
      <path d="M6.5 3.5h8l4 4v13h-12z" />
      <path d="M14.5 3.5v4h4" />
      <path d="M10.5 11.5v5l4-2.5z" />
    </>
  ),
  proof: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <path d="M3 9h18" />
      <path d="M7 13.5h6M7 16h4" />
    </>
  ),
};

/** One piece's icon, or the homepage's, drawn in the current colour. */
export function Icon({ of, className }: { of: Piece | 'proof'; className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('fill-none stroke-current', className)}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[of]}
    </svg>
  );
}
