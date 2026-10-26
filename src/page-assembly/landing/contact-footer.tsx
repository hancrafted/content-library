import { CopyEmail } from '@/page-assembly/landing/copy-email.client';
import { Button } from '@/shared/components/ui/button';
import { BOOKING_URL, CONTACT_EMAIL } from '@/shared/lib/contact';
import { externalHref } from '@/shared/lib/external-link.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { FooterBar } from '@/shared/page-chrome/footer/footer-bar';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type ContactT = Awaited<ReturnType<typeof getTranslations<'landing.contact'>>>;

function ContactActions({ t, newTab }: { t: ContactT; newTab: string }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <Button asChild className="h-auto min-h-12 rounded-full px-6 whitespace-normal">
        <a data-testid="contact-booking" href={externalHref(BOOKING_URL)} target="_blank" rel="noopener noreferrer">
          <CalendarDays aria-hidden="true" />
          {t('schedule')}
          <ArrowUpRight aria-hidden="true" />
          <span className="sr-only"> ({newTab})</span>
        </a>
      </Button>
      <CopyEmail email={CONTACT_EMAIL} labels={{ lead: t('emailLabel'), copy: t('copy'), copied: t('copied') }} />
    </div>
  );
}

/** The landing page's close: book a get-to-know call or write an email, above the site's footer bar. */
export async function ContactFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing.contact' });
  const newTab = (await getTranslations({ locale, namespace: 'nav' }))('newTab');
  return (
    <footer
      id="contact"
      data-testid="contact-footer"
      aria-labelledby="contact-heading"
      className="border-t border-border bg-card"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-2xl space-y-4">
          <h2 id="contact-heading" className="text-subheading font-semibold text-balance text-foreground">
            {t('title')}
          </h2>
          <p className="text-body text-muted-foreground text-pretty">{t('body')}</p>
        </div>
        <ContactActions t={t} newTab={newTab} />
      </div>
      <FooterBar locale={locale} />
    </footer>
  );
}
