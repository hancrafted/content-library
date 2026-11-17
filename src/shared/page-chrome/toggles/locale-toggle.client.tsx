'use client';

import { Button } from '@/shared/components/ui/button';
import { localesAt, localizePath, stripLocale, type Locale, type LocalesByRoute } from '@/shared/lib/locale.pure';
import { writePrefs } from '@/shared/lib/prefs-storage';
import { SEGMENTED_GROUP, segmentedItem } from '@/shared/page-chrome/toggles/segmented';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

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
      className={`min-h-11 min-w-10 px-2 font-mono text-caption font-medium lg:min-h-9.5 ${segmentedItem(option === locale)}`}
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
