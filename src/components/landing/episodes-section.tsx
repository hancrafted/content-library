import { LiquidInkTransition } from '@/components/animations/liquid-ink-transition.client';
import { cardLabels } from '@/components/landing/episode-card';
import { episodeCards } from '@/components/landing/episode-cards';
import { EpisodeSpotlight } from '@/components/landing/episode-spotlight';
import { Button } from '@/components/ui/button';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { ROUTES } from '@/lib/routes';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

function EpisodesHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h2>
      <p className="text-base text-muted-foreground sm:text-lg">{subtitle}</p>
    </div>
  );
}

/** A small mono heading with a hairline running out to the edge: names a part of the section without competing with its h2. */
function PartHeading({ children }: { children: string }) {
  return (
    <h3 className="mb-6 flex items-center gap-4 font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
      <span>{children}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </h3>
  );
}

/**
 * The landing's Episodes section: a Spotlight of the hottest
 * published Episodes to click straight into, plus a link to browse all Episodes; the layout references sit on /episodes.
 */
export async function EpisodesSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing' });
  const cards = await episodeCards(locale);
  return (
    <section id="episodes" tabIndex={-1} className="relative outline-none">
      <div className="mx-auto max-w-6xl space-y-16 px-6 pt-24 pb-96 sm:pt-32 sm:pb-112">
        <EpisodesHeader title={t('episodesSectionTitle')} subtitle={t('episodesSectionSubtitle')} />
        <div>
          <PartHeading>{t('episodeOverview.spotlightTitle')}</PartHeading>
          <EpisodeSpotlight cards={cards} locale={locale} labels={cardLabels(t)} headingLevel={4} />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-4 pt-4 border-t border-border/40">
          <Button asChild variant="outline" className="rounded-full">
            <Link
              href={localizePath(ROUTES.episodes, locale)}
              data-testid="landing-browse-episodes-link"
              className="inline-flex items-center gap-2"
            >
              <span>{t('episodeOverview.browseTitle')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <LiquidInkTransition targetId="services" />
    </section>
  );
}
