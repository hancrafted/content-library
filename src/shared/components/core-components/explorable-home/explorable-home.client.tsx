'use client';

import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import Link from 'next/link';
import { createContext, useContext, type ReactNode } from 'react';

/*
 * The "Explore it →" link of an Explorable shown in a Slide. The page container knows which Explorable pages exist
 * and in which locale, and provides them once, with the link's words; an Explorable's server entry places the link
 * by its own slug. The provider is the one client leaf: a server component cannot read context, and the link has to
 * sit inside the Explorable, which no Slide passes anything to.
 */

interface Homes {
  /** The slugs of the Explorable pages the link may reach. */
  readonly slugs: readonly string[];
  readonly locale: Locale;
  readonly label: string;
}

const HomesContext = createContext<Homes | undefined>(undefined);

export function ExplorableHomesProvider({ slugs, locale, label, children }: Homes & { readonly children: ReactNode }) {
  return <HomesContext value={{ slugs, locale, label }}>{children}</HomesContext>;
}

/** The link to the Explorable page of `slug`; nothing when it has no page, or when the page is the one showing it. */
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
