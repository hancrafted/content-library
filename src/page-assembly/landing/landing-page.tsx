import { AboutSection } from '@/page-assembly/landing/about-section';
import { ContactFooter } from '@/page-assembly/landing/contact-footer';
import { EpisodesSection } from '@/page-assembly/landing/episodes-section';
import { HeroSection } from '@/page-assembly/landing/hero-section';
import { MethodSection } from '@/page-assembly/landing/method-section';
import { landingJsonLd } from '@/page-assembly/lib/structured-data.pure';
import { JsonLdScript } from '@/shared/components/json-ld';
import type { Locale } from '@/shared/lib/locale.pure';
import { SITE_URL } from '@/shared/lib/site-url';

export function LandingPage({ locale }: { locale: Locale }) {
  return (
    <>
      <main data-testid="landing-page" className="flex flex-col min-h-screen">
        <JsonLdScript data={landingJsonLd(SITE_URL, locale)} />
        <HeroSection locale={locale} />
        <EpisodesSection locale={locale} />
        <MethodSection locale={locale} />
        <AboutSection locale={locale} />
      </main>
      <ContactFooter locale={locale} />
    </>
  );
}
