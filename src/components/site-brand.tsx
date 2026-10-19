import { BrandSymbol } from '@/components/brand-symbol';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { ROUTES } from '@/lib/routes';
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
      <span className="text-body font-semibold tracking-tight">{t('name')}</span>
    </Link>
  );
}
