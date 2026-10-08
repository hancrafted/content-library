'use client';

import { SEGMENTED_GROUP, segmentedItem } from '@/components/segmented';
import { Button } from '@/components/ui/button';
import { LOCALES, localizePath, stripLocale, type Locale } from '@/lib/locale.pure';
import { writePrefs } from '@/lib/prefs-storage';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Links to the same logical page in each locale, derived from the current pathname. */
export function LocaleToggle({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  return (
    <div role="group" aria-label={label} data-testid="locale-toggle" className={SEGMENTED_GROUP}>
      {LOCALES.map((option) => (
        <Button
          key={option}
          asChild
          size="sm"
          variant="ghost"
          className={`px-2.5 font-mono text-xs font-semibold ${segmentedItem(option === locale)}`}
        >
          <Link
            href={localizePath(stripLocale(pathname), option)}
            hrefLang={option}
            aria-current={option === locale ? 'true' : undefined}
            data-testid={`locale-${option}`}
            data-active={option === locale}
            onClick={() => writePrefs({ locale: option })}
          >
            {option.toUpperCase()}
          </Link>
        </Button>
      ))}
    </div>
  );
}
