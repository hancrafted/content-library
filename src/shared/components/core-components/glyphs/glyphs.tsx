import { cn } from '@/shared/lib/utils';

/** The AI sparkle, the Visual language's mark on a job the AI does. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('shrink-0', className)} aria-hidden="true">
      <path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8 6.6 6.6z" className="fill-ai" />
    </svg>
  );
}
