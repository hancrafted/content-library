import { AboutSection } from '@/components/landing/about-section';
import { EpisodesSection } from '@/components/landing/episodes-section';
import { HeroSection } from '@/components/landing/hero-section';
import { MethodRailSection } from '@/components/landing/method-rail-section.client';
import type { Locale } from '@/lib/locale.pure';

export function LandingPage({ locale }: { locale: Locale }) {
  return (
    <main data-testid="landing-page" className="flex flex-col min-h-screen">
      <HeroSection locale={locale} />
      <EpisodesSection locale={locale} />
      <MethodRailSection locale={locale} />
      <AboutSection locale={locale} />
    </main>
  );
}
