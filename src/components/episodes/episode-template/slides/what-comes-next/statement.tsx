import type { ReactNode } from 'react';

// A server part of this Slide: it takes plain props, never the kit; the Slide reads its strings with `t` and passes
// them in. A part two Slides share moves to `src/components/slide-shared/`.
export function Statement({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-heading font-semibold tracking-tight text-balance">{children}</p>;
}
