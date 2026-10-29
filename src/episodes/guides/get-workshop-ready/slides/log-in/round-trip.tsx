import type { ReactNode } from 'react';

/** One stop of the round trip: its numbered label over its picture; `lit` marks the stop the viewer acts in. */
function Stop({ label, lit = false, children }: { label: string; lit?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p
        className={
          lit ? 'text-caption font-semibold uppercase text-primary' : 'text-caption uppercase text-muted-foreground'
        }
      >
        {label}
      </p>
      {children}
    </div>
  );
}

/** The two arrows between the terminal and the browser: out muted, the way back in `primary`. */
function Arrows({ out, back }: { out: string; back: string }) {
  return (
    <div className="flex items-center justify-center gap-6 md:flex-col md:gap-10 md:self-center">
      <svg viewBox="0 0 60 24" className="w-12 rotate-90 md:w-full md:rotate-0" role="img" aria-label={out}>
        <path d="M4 12 H50" className="fill-none stroke-muted-foreground" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M44 5 L54 12 L44 19"
          className="fill-none stroke-muted-foreground"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg viewBox="0 0 60 24" className="w-12 rotate-90 md:w-full md:rotate-0" role="img" aria-label={back}>
        <path d="M56 12 H10" className="fill-none stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M16 5 L6 12 L16 19"
          className="fill-none stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** What the round trip shows: three pictures and their words, the browser stop the one lit. */
export interface RoundTripProps {
  readonly labels: { readonly terminal: string; readonly browser: string; readonly back: string };
  readonly arrows: { readonly out: string; readonly back: string };
  readonly terminal: ReactNode;
  readonly browser: ReactNode;
  readonly back: ReactNode;
}

/**
 * The login as a round trip (Option 4a): the terminal sends the viewer to the browser and expects them back. On a
 * phone the stops stack, the arrows turned to point down the page.
 */
export function RoundTrip({ labels, arrows, terminal, browser, back }: RoundTripProps) {
  return (
    <div className="grid items-start gap-4 md:grid-cols-12" data-round-trip="">
      <div className="md:col-span-4">
        <Stop label={labels.terminal}>{terminal}</Stop>
      </div>
      <div className="md:col-span-1 md:self-center">
        <Arrows out={arrows.out} back={arrows.back} />
      </div>
      <div className="md:col-span-4">
        <Stop label={labels.browser} lit>
          {browser}
        </Stop>
      </div>
      <div className="md:col-span-3">
        <Stop label={labels.back}>{back}</Stop>
      </div>
    </div>
  );
}
