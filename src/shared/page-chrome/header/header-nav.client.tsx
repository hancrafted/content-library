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
import { ArrowUpRight, BookOpen, CalendarDays, FlaskConical, Layers, Play, Workflow } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRef, useState, useSyncExternalStore } from 'react';
import styles from './header.module.css';

const ICONS = {
  flask: FlaskConical,
  calendar: CalendarDays,
  play: Play,
  book: BookOpen,
  layers: Layers,
  workflow: Workflow,
};

export interface HeaderNavLink {
  label: string;
  description: string;
  icon: keyof typeof ICONS;
  section: string;
  testId: string;
  alsoIn?: readonly string[];
}

function MenuLink({ link, locale, select }: { link: HeaderNavLink; locale: Locale; select: () => void }) {
  const Icon = ICONS[link.icon];
  const description = `${link.testId}-description`;
  return (
    <div className={styles.entry}>
      <Icon aria-hidden className={cn(styles.entryIcon, 'size-5')} />
      <NavigationMenuLink asChild onSelect={select} className={cn(styles.entryLink, 'text-body')}>
        <NavLink
          section={link.section}
          alsoIn={link.alsoIn}
          href={localizePath(link.section, locale)}
          data-testid={link.testId}
          aria-describedby={description}
        >
          {link.label}
        </NavLink>
      </NavigationMenuLink>
      <p id={description} className={cn(styles.description, 'text-caption text-muted-foreground')}>
        {link.description}
      </p>
      <ArrowUpRight aria-hidden className={cn(styles.entryArrow, 'size-4')} />
    </div>
  );
}

function TopLinks({ links, locale, select }: { links: readonly HeaderNavLink[]; locale: Locale; select: () => void }) {
  return links.map((link) => (
    <NavigationMenuItem key={link.testId} className={styles.topItem} data-header-ink-target={link.testId}>
      <MenuLink link={link} locale={locale} select={select} />
    </NavigationMenuItem>
  ));
}

interface HeaderNavProps {
  locale: Locale;
  label: string;
  lead: readonly HeaderNavLink[];
  learnLabel: string;
  learnIntro: string;
  learn: readonly HeaderNavLink[];
}

function useLearnMenu() {
  const [value, setValue] = useState('');
  const pinned = useRef(false);
  const close = () => {
    pinned.current = false;
    setValue('');
  };
  const change = (next: string) => {
    if (next || !pinned.current) setValue(next);
  };
  const click = (event: React.MouseEvent) => {
    if (value === 'learn' && !pinned.current) {
      // A click after hover pins the panel instead of toggling it closed.
      event.preventDefault();
      pinned.current = true;
    } else {
      pinned.current = !pinned.current;
    }
  };
  return { value, close, change, click };
}

interface LearnProps {
  nav: HeaderNavProps;
  menu: ReturnType<typeof useLearnMenu>;
}

function dismissOutside(close: () => void, event: Event) {
  if (event.target instanceof Element && event.target.closest('[data-slot="navigation-menu-trigger"]')) return;
  close();
}

function LearnPanel({ nav, menu }: LearnProps) {
  return (
    <NavigationMenuContent
      forceMount
      className={styles.learnPanel}
      onEscapeKeyDown={menu.close}
      onPointerDownOutside={(event) => dismissOutside(menu.close, event)}
      onFocusOutside={(event) => dismissOutside(menu.close, event)}
    >
      <div className={styles.learnIntro}>
        <span className="text-caption text-muted-foreground">{nav.learnLabel}</span>
        <p className="mt-3 text-body font-semibold">{nav.learnIntro}</p>
      </div>
      <ul aria-label={nav.learnLabel} className="grid gap-1">
        {nav.learn.map((link) => (
          <li key={link.testId}>
            <MenuLink link={link} locale={nav.locale} select={menu.close} />
          </li>
        ))}
      </ul>
    </NavigationMenuContent>
  );
}

function LearnMenu({ nav, menu }: LearnProps) {
  const pathname = usePathname();
  const active = nav.learn.some(({ section, alsoIn }) => isAnySectionActive(pathname, [section, ...(alsoIn ?? [])]));
  return (
    <NavigationMenuItem value="learn" data-testid="nav-learn">
      <span data-testid="nav-learn-label" className={cn(styles.learnLabel, 'text-caption text-muted-foreground')}>
        {nav.learnLabel}
      </span>
      <NavigationMenuTrigger
        data-header-ink-target="nav-learn"
        data-active={active}
        className={cn(styles.learnTrigger, 'text-body')}
        onClick={menu.click}
      >
        {nav.learnLabel}
      </NavigationMenuTrigger>
      <LearnPanel nav={nav} menu={menu} />
    </NavigationMenuItem>
  );
}

function subscribeToLayout(changed: () => void) {
  const desktop = window.matchMedia('(min-width: 64rem)');
  desktop.addEventListener('change', changed);
  return () => desktop.removeEventListener('change', changed);
}

function isMobile() {
  return !window.matchMedia('(min-width: 64rem)').matches;
}

/** Hover previews Learn; a click pins it. Mobile shows the same links as an expanded list. */
export function HeaderNav(nav: HeaderNavProps) {
  const menu = useLearnMenu();
  const mobile = useSyncExternalStore(subscribeToLayout, isMobile, () => false);
  return (
    <NavigationMenu
      viewport={false}
      aria-label={nav.label}
      data-testid="site-nav"
      className={styles.navigation}
      value={mobile ? 'learn' : menu.value}
      onValueChange={mobile ? undefined : menu.change}
    >
      <NavigationMenuList className={styles.navigationList}>
        <TopLinks links={nav.lead} locale={nav.locale} select={menu.close} />
        <LearnMenu nav={nav} menu={menu} />
      </NavigationMenuList>
    </NavigationMenu>
  );
}
