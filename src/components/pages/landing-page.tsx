import { LiquidInkTransition } from '@/components/animations/liquid-ink-transition.client';
import { AboutSection } from '@/components/landing/about-section';
import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { episodeCards } from '@/components/landing/episode-cards';
import { HeroSection } from '@/components/landing/hero-section';
import { MethodRailSection } from '@/components/landing/method-rail-section.client';
import type { EpisodeIcon } from '@/lib/episode-index.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Coins,
  Compass,
  FileText,
  GitBranch,
  Layers,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface SubComponentProps {
  locale: Locale;
  t: Awaited<ReturnType<typeof getTranslations<'landing'>>>;
}

const ICONS: Record<EpisodeIcon, LucideIcon> = {
  'book-open': BookOpen,
  'file-text': FileText,
  coins: Coins,
  brain: Brain,
  users: Users,
  compass: Compass,
  'shield-check': ShieldCheck,
  'git-branch': GitBranch,
};

const CARD_CLASS =
  'group flex flex-col justify-between p-8 rounded-3xl bg-card border border-border/60 shadow-md transition-all';

function CardBody({ card, footer }: { card: EpisodeCard; footer: ReactNode }) {
  const Icon = ICONS[card.icon];
  return (
    <>
      <div className="space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {card.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{card.caption}</p>
      </div>
      {footer}
    </>
  );
}

function OpenFooter({ label }: { label: string }) {
  return (
    <div className="pt-6 inline-flex items-center gap-2 font-mono text-xs font-semibold text-primary uppercase tracking-wider">
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
    </div>
  );
}

function EpisodeCardView({ card, locale, t }: { card: EpisodeCard; locale: Locale; t: SubComponentProps['t'] }) {
  if (card.route === null) {
    const footer = (
      <div className="pt-6 font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {t('episodeIndex.comingSoon')}
      </div>
    );
    return (
      <div data-episode-status="upcoming" className={`${CARD_CLASS} opacity-70`}>
        <CardBody card={card} footer={footer} />
      </div>
    );
  }
  return (
    <Link href={localizePath(card.route, locale)} className={`${CARD_CLASS} hover:border-primary/50 hover:shadow-xl`}>
      <CardBody card={card} footer={<OpenFooter label={t('episodeIndex.open')} />} />
    </Link>
  );
}

function EpisodesHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="text-muted-foreground text-base sm:text-lg">{subtitle}</p>
    </div>
  );
}

async function EpisodeCardsGrid({ locale, t }: SubComponentProps) {
  const cards = await episodeCards(locale);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {cards.map((card) => (
        <EpisodeCardView key={card.slug} card={card} locale={locale} t={t} />
      ))}
    </div>
  );
}

/** The layout reference is not content, so it sits outside the index: a plain link under the cards. */
function TemplateLink({ locale, t }: SubComponentProps) {
  return (
    <Link
      href={localizePath(episodeRoute('page-template'), locale)}
      data-testid="landing-page-link"
      className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors"
    >
      <Layers className="h-3.5 w-3.5" />
      <span>{t('templateTitle')}</span>
    </Link>
  );
}

function LandingEpisodes({ locale, t }: SubComponentProps) {
  return (
    <section id="episodes" className="relative">
      <div className="py-24 sm:py-32 px-6 max-w-6xl mx-auto space-y-12">
        <EpisodesHeader title={t('episodesSectionTitle')} subtitle={t('episodesSectionSubtitle')} />
        <EpisodeCardsGrid locale={locale} t={t} />
        <TemplateLink locale={locale} t={t} />
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
