import { workshopCards } from '@/components/landing/workshop-cards';
import { TRANSLATIONS } from '@/i18n/translations';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { ROUTES } from '@/lib/routes';
import { WORKSHOPS, type WorkshopSlug } from '@/lib/workshops.pure';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

/** A Workshop page's title and description in one locale, for its metadata. */
export function workshopPageCopy(slug: WorkshopSlug, locale: Locale) {
  return TRANSLATIONS[locale].workshopsPage.items[slug];
}

/**
 * A Workshop's own page. For now the event essentials only: the date, the time and the description;
 * the ordered Episode list and its start button come with the Workshop page itself.
 */
export async function WorkshopPage({ slug, locale }: { slug: string; locale: Locale }) {
  if (!WORKSHOPS.some((workshop) => workshop.slug === slug)) notFound();
  const t = await getTranslations({ locale, namespace: 'workshopsPage' });
  const card = (await workshopCards(locale)).find((each) => each.slug === slug);
  if (card === undefined) notFound();
  return (
    <main data-testid="workshop-page" className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <Link
        href={localizePath(ROUTES.workshops, locale)}
        className="inline-flex items-center gap-2 text-caption font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t('back')}
      </Link>
      <h1 className="mt-6 text-heading font-semibold text-foreground">{card.title}</h1>
      <p className="mt-3 text-body text-muted-foreground">
        <time dateTime={card.date}>{card.dateLabel}</time>
        {card.time !== undefined && <span> · {card.time}</span>}
        {card.location !== undefined && <span> · {card.location}</span>}
      </p>
      <p className="mt-6 text-body text-foreground">{card.description}</p>
    </main>
  );
}
