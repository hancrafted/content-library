import type { ReactNode } from 'react';

/** The container every header-nav page sits in, so its title keeps one place when the reader clicks between them. */
export const PAGE_CONTAINER = 'mx-auto w-full max-w-6xl px-6 py-12 sm:py-16';

/**
 * The title and one-line intro of a header-nav page: Episodes, Events, Content pipeline. The title is the page's
 * one h1, set in the subheading role so the three read as one family; `children` sit under the intro.
 */
export function PageHeader({ title, intro, children }: { title: string; intro: ReactNode; children?: ReactNode }) {
  return (
    <header data-page-header className="mb-10 max-w-3xl space-y-3">
      <h1 className="text-subheading font-semibold text-balance text-foreground">{title}</h1>
      <div className="text-body text-muted-foreground text-pretty">{intro}</div>
      {children}
    </header>
  );
}
