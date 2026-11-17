import type { ReactNode } from 'react';

export const PAGE_CONTAINER = 'mx-auto w-full max-w-6xl px-6 py-12 sm:py-16';

export function PageHeader({ title, intro, children }: { title: string; intro: ReactNode; children?: ReactNode }) {
  return (
    <header data-page-header className="mb-10 max-w-3xl space-y-3">
      <h1 className="text-subheading font-semibold text-balance text-foreground">{title}</h1>
      <div className="text-body text-muted-foreground text-pretty">{intro}</div>
      {children}
    </header>
  );
}
