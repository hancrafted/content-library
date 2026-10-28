'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/shared/components/ui/navigation-menu';
import { isAnySectionActive, localizePath, type Locale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { NavLink } from '@/shared/page-chrome/header/nav-link.client';
import { usePathname } from 'next/navigation';

export interface HeaderNavLink {
  label: string;
  section: string;
  testId: string;
  alsoIn?: readonly string[];
}

const ACTIVE = 'bg-selected text-selected-foreground hover:bg-selected hover:text-selected-foreground';

/** The menu link's own box and states yield to NavLink's button look; the selected colours follow NavLink's `data-active`. */
const LINK =
  'flex-row justify-center gap-0 px-3 py-0 text-body max-lg:justify-start data-[active=true]:bg-selected data-[active=true]:text-selected-foreground data-[active=true]:hover:bg-selected data-[active=true]:hover:text-selected-foreground data-[active=true]:focus:bg-selected';

function MenuLink({ link, locale }: { link: HeaderNavLink; locale: Locale }) {
  return (
    <NavigationMenuLink asChild className={LINK}>
      <NavLink
        section={link.section}
        alsoIn={link.alsoIn}
        href={localizePath(link.section, locale)}
        data-testid={link.testId}
      >
        {link.label}
      </NavLink>
    </NavigationMenuLink>
  );
}

function TopLinks({ links, locale }: { links: readonly HeaderNavLink[]; locale: Locale }) {
  return links.map((link) => (
    <NavigationMenuItem key={link.testId}>
      <MenuLink link={link} locale={locale} />
    </NavigationMenuItem>
  ));
}

function LearnPanel({ label, links, locale }: { label: string; links: readonly HeaderNavLink[]; locale: Locale }) {
  return (
    <NavigationMenuContent
      forceMount
      className="max-lg:static max-lg:mt-0 max-lg:block max-lg:overflow-visible max-lg:border-0 max-lg:bg-transparent max-lg:p-0 max-lg:pl-3 max-lg:shadow-none max-lg:group-data-[viewport=false]/navigation-menu:mt-0 max-lg:group-data-[viewport=false]/navigation-menu:border-0 max-lg:group-data-[viewport=false]/navigation-menu:bg-transparent max-lg:group-data-[viewport=false]/navigation-menu:shadow-none lg:data-[state=closed]:hidden"
    >
      <ul aria-label={label} className="flex min-w-40 flex-col gap-1 p-1 max-lg:min-w-0">
        {links.map((link) => (
          <li key={link.testId}>
            <MenuLink link={link} locale={locale} />
          </li>
        ))}
      </ul>
    </NavigationMenuContent>
  );
}

/**
 * Learn is a menu trigger with no page of its own. From `lg` up it opens a panel of its entries; below `lg` the entries
 * stay mounted and show as a labelled group in the header's menu panel, so each link keeps one copy in the page.
 */
function LearnMenu({ label, links, locale }: { label: string; links: readonly HeaderNavLink[]; locale: Locale }) {
  const pathname = usePathname();
  const active = links.some(({ section, alsoIn }) => isAnySectionActive(pathname, [section, ...(alsoIn ?? [])]));
  return (
    <NavigationMenuItem data-testid="nav-learn" className="max-lg:w-full">
      <span
        data-testid="nav-learn-label"
        className="block px-3 py-1.5 text-caption font-medium text-muted-foreground lg:hidden"
      >
        {label}
      </span>
      <NavigationMenuTrigger
        data-active={active}
        className={cn(
          'h-8 gap-1.5 rounded-md bg-transparent px-3 py-0 text-body max-lg:hidden',
          active ? ACTIVE : 'text-muted-foreground',
        )}
      >
        {label}
      </NavigationMenuTrigger>
      <LearnPanel label={label} links={links} locale={locale} />
    </NavigationMenuItem>
  );
}

/**
 * The header's navigation: Explorables, Events, Learn (a menu of Episodes and Resources), then optionally the
 * Dashboard. `lead` and `trail` are the links before and after Learn.
 */
export function HeaderNav({
  locale,
  label,
  lead,
  learnLabel,
  learn,
  trail,
}: {
  locale: Locale;
  label: string;
  lead: readonly HeaderNavLink[];
  learnLabel: string;
  learn: readonly HeaderNavLink[];
  trail: readonly HeaderNavLink[];
}) {
  return (
    <NavigationMenu
      viewport={false}
      aria-label={label}
      data-testid="site-nav"
      className="max-w-none flex-none justify-start max-lg:self-stretch"
    >
      <NavigationMenuList className="gap-1 max-lg:w-full max-lg:flex-col max-lg:items-stretch">
        <TopLinks links={lead} locale={locale} />
        <LearnMenu label={learnLabel} links={learn} locale={locale} />
        <TopLinks links={trail} locale={locale} />
      </NavigationMenuList>
    </NavigationMenu>
  );
}
