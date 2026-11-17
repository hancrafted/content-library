'use client';

import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import Link from 'next/link';
import { createContext, useContext, type ReactNode } from 'react';

interface Homes {
  readonly slugs: readonly string[];
  readonly locale: Locale;
  readonly label: string;
}

const HomesContext = createContext<Homes | undefined>(undefined);

export function ExplorableHomesProvider({ slugs, locale, label, children }: Homes & { readonly children: ReactNode }) {
  return <HomesContext value={{ slugs, locale, label }}>{children}</HomesContext>;
}

export function ExploreItLink({ slug }: { readonly slug: string }) {
  const context = useContext(HomesContext);
  if (context === undefined || !context.slugs.includes(slug)) return null;
  return (
    <p className="mt-2 text-right">
      <Link
        href={localizePath(`${ROUTES.explorables}/${slug}`, context.locale)}
        data-explore-it={slug}
        className="text-caption font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {context.label}
      </Link>
    </p>
  );
}
