import { LiquidInkTransition } from '@/components/animations/liquid-ink-transition.client';
import { AboutSection } from '@/components/landing/about-section';
import { MethodRailSection } from '@/components/landing/method-rail-section.client';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';
import { ArrowRight, BookOpen, Layers } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface SubComponentProps {
  locale: Locale;
  t: Awaited<ReturnType<typeof getTranslations<'landing'>>>;
}

function LandingHero({ locale, t }: SubComponentProps) {
  return (
    <section className="relative px-6 pt-24 pb-20 sm:pt-32 sm:pb-28 max-w-5xl mx-auto space-y-6 text-center">
      <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
        <span>hancrafted // theory</span>
      </div>
      <h1
        data-testid="page-title"
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]"
      >
        {t('title')}
      </h1>
      <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">{t('heroSubtitle')}</p>
      <div className="pt-4 flex items-center justify-center gap-4">
        <Link
          href={localizePath(episodeRoute('amnesiac-freelancer'), locale)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-sm font-semibold bg-primary text-primary-foreground shadow-md hover:opacity-90 transition-all"
        >
          <span>{t('exploreEpisodes')}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

interface EpisodeCardProps {
  title: string;
  description: string;
  route: string;
  locale: Locale;
  testId?: string;
  icon: typeof BookOpen;
}

function EpisodeCard({ title, description, route, locale, testId, icon: Icon }: EpisodeCardProps) {
  return (
    <Link
      href={localizePath(route, locale)}
      data-testid={testId}
      className="group flex flex-col justify-between p-8 rounded-3xl bg-card border border-border/60 hover:border-primary/50 shadow-md hover:shadow-xl transition-all"
    >
      <div className="space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="pt-6 inline-flex items-center gap-2 font-mono text-xs font-semibold text-primary uppercase tracking-wider">
        <span>Open Episode</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

function EpisodesHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="font-mono text-xs font-bold tracking-widest uppercase text-primary">
        CHAPTER 02 // THE ARCHIVE
      </div>
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="text-muted-foreground text-base sm:text-lg">{subtitle}</p>
    </div>
  );
}

function LandingEpisodes({ locale, t }: SubComponentProps) {
  return (
    <section data-chapter="02" className="relative">
      <div className="py-24 sm:py-32 px-6 max-w-6xl mx-auto space-y-12">
        <EpisodesHeader title={t('episodesSectionTitle')} subtitle={t('episodesSectionSubtitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <EpisodeCard
            title={t('amnesiacTitle')}
            description={t('amnesiacDescription')}
            route={episodeRoute('amnesiac-freelancer')}
            locale={locale}
            icon={BookOpen}
          />
          <EpisodeCard
            title={t('templateTitle')}
            description={t('templateDescription')}
            route={episodeRoute('page-template')}
            locale={locale}
            testId="landing-page-link"
            icon={Layers}
          />
        </div>
      </div>
      <LiquidInkTransition targetId="services" />
    </section>
  );
}

export async function LandingPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing' });

  return (
    <main data-testid="landing-page" className="flex flex-col min-h-screen">
      <LandingHero locale={locale} t={t} />
      <LandingEpisodes locale={locale} t={t} />
      <MethodRailSection locale={locale} />
      <AboutSection locale={locale} />
    </main>
  );
}
