import { LiquidInkTransition } from '@/components/animations/liquid-ink-transition.client';
import { AboutSection } from '@/components/landing/about-section';
import { HeroSection } from '@/components/landing/hero-section';
import { MethodRailSection } from '@/components/landing/method-rail-section.client';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';
import { ArrowRight, BookOpen, Coins, FileText, Layers, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface SubComponentProps {
  locale: Locale;
  t: Awaited<ReturnType<typeof getTranslations<'landing'>>>;
}

interface EpisodeCardProps {
  title: string;
  description: string;
  route: string;
  locale: Locale;
  testId?: string;
  icon: LucideIcon;
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

const EPISODE_CARDS: readonly {
  slug: Parameters<typeof episodeRoute>[0];
  titleKey: 'amnesiacTitle' | 'markdownTitle' | 'tokenEconomyTitle' | 'templateTitle';
  descKey: 'amnesiacDescription' | 'markdownDescription' | 'tokenEconomyDescription' | 'templateDescription';
  icon: LucideIcon;
  testId?: string;
}[] = [
  {
    slug: 'amnesiac-freelancer',
    titleKey: 'amnesiacTitle',
    descKey: 'amnesiacDescription',
    icon: BookOpen,
  },
  {
    slug: 'maintaining-markdown-for-ai',
    titleKey: 'markdownTitle',
    descKey: 'markdownDescription',
    icon: FileText,
  },
  {
    slug: 'ai-token-economy',
    titleKey: 'tokenEconomyTitle',
    descKey: 'tokenEconomyDescription',
    icon: Coins,
  },
  {
    slug: 'page-template',
    titleKey: 'templateTitle',
    descKey: 'templateDescription',
    icon: Layers,
    testId: 'landing-page-link',
  },
];

function EpisodeCardsGrid({ locale, t }: SubComponentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {EPISODE_CARDS.map(({ slug, titleKey, descKey, icon, testId }) => (
        <EpisodeCard
          key={slug}
          title={t(titleKey)}
          description={t(descKey)}
          route={episodeRoute(slug)}
          locale={locale}
          testId={testId}
          icon={icon}
        />
      ))}
    </div>
  );
}

function LandingEpisodes({ locale, t }: SubComponentProps) {
  return (
    <section id="episodes" data-chapter="02" className="relative">
      <div className="py-24 sm:py-32 px-6 max-w-6xl mx-auto space-y-12">
        <EpisodesHeader title={t('episodesSectionTitle')} subtitle={t('episodesSectionSubtitle')} />
        <EpisodeCardsGrid locale={locale} t={t} />
      </div>
      <LiquidInkTransition targetId="services" />
    </section>
  );
}

export async function LandingPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing' });

  return (
    <main data-testid="landing-page" className="flex flex-col min-h-screen">
      <HeroSection locale={locale} />
      <LandingEpisodes locale={locale} t={t} />
      <MethodRailSection locale={locale} />
      <AboutSection locale={locale} />
    </main>
  );
}
