import type { Locale } from '@/shared/lib/locale.pure';
import { SocialLinks } from '@/shared/page-chrome/social-links';
import { getTranslations } from 'next-intl/server';

/** The site's footer bar, the last line of a page: the brand's copyright and the social profiles. */
export async function FooterBar({ locale }: { locale: Locale }) {
  const brand = (await getTranslations({ locale, namespace: 'brand' }))('name');
  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4 text-caption text-muted-foreground">
      <span>© {brand}</span>
      <SocialLinks locale={locale} />
    </div>
  );
}
