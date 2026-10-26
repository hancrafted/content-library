import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/routes';
import { BrandSymbol } from '@/shared/page-chrome/header/brand-symbol';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

/** Brand symbol plus site name; both lead to the landing page. */
export async function SiteBrand({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'brand' });
  return (
    <Link
      href={localizePath(ROUTES.home, locale)}
      aria-label={t('home')}
      data-testid="brand"
      className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <BrandSymbol className="size-8 shrink-0" />
      <span className="text-body font-semibold tracking-tight max-[379px]:sr-only">
        {t('name')}
        <span aria-hidden className="inline-block origin-[0_72%] scale-150 text-brand-accent">
          .
        </span>
      </span>
    </Link>
  );
}
