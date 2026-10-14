import { cn } from '@/lib/utils';

/**
 * The primary rail under the three notes: one line growing to an arrowhead, then its label. All three notes run at
 * once, and all three take months. A server part with plain props; `className` carries the Slide's motion.
 */
export function TimeRail({ label, className }: { label: string; className?: string }) {
  return (
    <div data-time-rail="" className={cn('mt-6 flex items-center gap-3', className)}>
      <span className="flex flex-1 items-center text-primary" data-rail-line="">
        <span className="h-1 flex-1 rounded-full bg-primary" />
        <svg aria-hidden="true" viewBox="0 0 16 20" className="h-4 w-3 flex-none" fill="currentColor">
          <path d="M0 0 L16 10 L0 20 Z" />
        </svg>
      </span>
      <span data-rail-label="" className="text-caption font-medium text-primary">
        {label}
      </span>
    </div>
  );
}
