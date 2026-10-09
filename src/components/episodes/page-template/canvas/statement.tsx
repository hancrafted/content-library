import type { ReactNode } from 'react';

// `canvas/` holds the server parts and data several of an Episode's Slides share. A part takes plain props,
// never the kit: the Slide reads its strings with `t` and passes them in.
export function Statement({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">{children}</p>;
}
