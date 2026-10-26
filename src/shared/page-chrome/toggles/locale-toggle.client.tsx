'use client';

import { Button } from '@/shared/components/ui/button';
import { localesAt, localizePath, stripLocale, type Locale, type LocalesByRoute } from '@/shared/lib/locale.pure';
import { writePrefs } from '@/shared/lib/prefs-storage';
import { SEGMENTED_GROUP, segmentedItem } from '@/shared/page-chrome/toggles/segmented';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

/** The fragment the reader is at, read at click time: the toggle sits outside the Episode page and its service. */
function currentFragment(): string | undefined {
  return window.location.hash.slice(1) || undefined;
}

function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function LocaleOption({ option, locale, pathname }: { option: Locale; locale: Locale; pathname: string }) {
  const router = useRouter();
  const switchTo = (event: MouseEvent) => {
    writePrefs({ locale: option });
    if (!isPlainClick(event)) return;
    event.preventDefault();
    router.push(localizePath(stripLocale(pathname), option, currentFragment()));
  };
  return (
    <Button
      asChild
      size="sm"
      variant="ghost"
      className={`px-2.5 font-mono text-body font-semibold ${segmentedItem(option === locale)}`}
    >
      <Link
        href={localizePath(stripLocale(pathname), option)}
        hrefLang={option}
        aria-current={option === locale ? 'true' : undefined}
        data-testid={`locale-${option}`}
        data-active={option === locale}
        onClick={switchTo}
      >
        {option.toUpperCase()}
      </Link>
    </Button>
  );
}

/**
 * Links to the same logical page in each locale, derived from the current
 * pathname. A plain click carries the reader's Slide (the URL fragment) across,
 * so the other locale opens on the same Slide; the link itself stays a plain
 * path, which is what a new tab or a crawler follows. It offers only the locales the current page is exported in,
 * from `localesByRoute`, which the layout reads from the page catalogue.
 */
export function LocaleToggle({
  locale,
  label,
  localesByRoute,
}: {
  locale: Locale;
  label: string;
  localesByRoute: LocalesByRoute;
}) {
  const pathname = usePathname();
  const locales = localesAt(pathname, localesByRoute);
  return (
    <div role="group" aria-label={label} data-testid="locale-toggle" className={SEGMENTED_GROUP}>
      {locales.map((option) => (
        <LocaleOption key={option} option={option} locale={locale} pathname={pathname} />
      ))}
    </div>
  );
}
