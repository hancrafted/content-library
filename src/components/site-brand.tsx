import { localizePath, type Locale } from '@/lib/locale.pure';
import { MESSAGES } from '@/lib/messages';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

/** Placeholder logo plus site name; both lead to the landing page. */
export function SiteBrand({ locale }: { locale: Locale }) {
  const t = MESSAGES[locale].brand;
  return (
    <Link
      href={localizePath(ROUTES.home, locale)}
      aria-label={t.home}
      data-testid="brand"
      className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-full bg-primary font-mono text-sm font-semibold text-primary-foreground"
      >
        H
      </span>
      <span className="text-base font-semibold tracking-tight">{t.name}</span>
    </Link>
  );
}
