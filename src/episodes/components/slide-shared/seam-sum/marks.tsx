import { cn } from '@/shared/lib/utils';

export function Cross({ label }: { label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className="absolute -top-3 right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
    >
      <svg viewBox="0 0 16 16" className="size-3" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" className="fill-none stroke-current" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    </span>
  );
}

function PersonGlyph() {
  return (
    <>
      <circle cx="8" cy="5" r="3" className="fill-current" />
      <path d="M2.5 15c0-3.3 2.4-5.5 5.5-5.5s5.5 2.2 5.5 5.5z" className="fill-current" />
    </>
  );
}

function AgentGlyph() {
  return (
    <>
      <path d="M8 1.5v2.5" className="fill-none stroke-current" strokeWidth={1.5} strokeLinecap="round" />
      <rect x="2.5" y="4.5" width="11" height="9" rx="2.5" className="fill-current" />
      <circle cx="6" cy="9" r="1.2" className="fill-card" />
      <circle cx="10" cy="9" r="1.2" className="fill-card" />
    </>
  );
}

export function DoneBy({ who, label }: { who: 'person' | 'agent'; label: string }) {
  return (
    <span
      data-done-by={who}
      role="img"
      aria-label={label}
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-card',
        who === 'person' ? 'border-human text-human' : 'border-ai text-ai',
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
        {who === 'person' ? <PersonGlyph /> : <AgentGlyph />}
      </svg>
    </span>
  );
}

export function Tick({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 16 16" className="mt-1 size-4 shrink-0 text-foreground" role="img" aria-label={label}>
      <path
        d="M3 8.5l3 3 7-7"
        className="fill-none stroke-current"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SeamIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden>
      <path
        d="M2 8h9M8 4.5L11.5 8 8 11.5"
        className="fill-none stroke-current"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 3v10" className="fill-none stroke-current" strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  );
}
