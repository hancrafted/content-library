import { JsonLdScript } from '@/components/json-ld';
import { AboutSection } from '@/components/landing/about-section';
import { EpisodesSection } from '@/components/landing/episodes-section';
import { HeroSection } from '@/components/landing/hero-section';
import { MethodSection } from '@/components/landing/method-section';
import type { Locale } from '@/lib/locale.pure';
import { SITE_URL } from '@/lib/site-url';
import { landingJsonLd } from '@/lib/structured-data.pure';

export function LandingPage({ locale }: { locale: Locale }) {
  return (
    <main data-testid="landing-page" className="flex flex-col min-h-screen">
      <JsonLdScript data={landingJsonLd(SITE_URL, locale)} />
      <HeroSection locale={locale} />
      <EpisodesSection locale={locale} />
      <MethodSection locale={locale} />
      <AboutSection locale={locale} />
    </main>
  );
}
