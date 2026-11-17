import type { ReactNode } from 'react';

export function Statement({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-heading font-semibold tracking-tight text-balance">{children}</p>;
}
