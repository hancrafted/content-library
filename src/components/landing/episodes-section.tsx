import { LiquidInkTransition } from '@/components/animations/liquid-ink-transition.client';
import { episodeCards } from '@/components/landing/episode-cards';
import type { CardLabels } from '@/components/landing/episode-grid-card';
import { EpisodeSpotlight } from '@/components/landing/episode-spotlight';
import { Button } from '@/components/ui/button';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute, ROUTES } from '@/lib/routes';
import { ArrowRight, Layers, LayoutTemplate } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type LandingT = Awaited<ReturnType<typeof getTranslations<'landing'>>>;

function cardLabels(t: LandingT): CardLabels {
  return {
    open: t('episodeOverview.open'),
    comingSoon: t('episodeOverview.comingSoon'),
    minutesUnit: t('episodeOverview.minutesUnit'),
  };
}

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

const REFERENCE_LINK =
  'inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary';

/** The layout references are not content, so they sit outside the Episode overview: plain links under the cards. */
function ReferenceLinks({ locale, t }: { locale: Locale; t: LandingT }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      <Link
        href={localizePath(episodeRoute('page-template'), locale)}
        data-testid="landing-page-link"
        className={REFERENCE_LINK}
      >
        <Layers className="h-3.5 w-3.5" />
        <span>{t('templateTitle')}</span>
      </Link>
      <Link
        href={localizePath(episodeRoute('slide-master'), locale)}
        data-testid="landing-slide-master-link"
        className={REFERENCE_LINK}
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
        <span>{t('slideMasterTitle')}</span>
      </Link>
    </div>
  );
}

/**
 * The landing's Episodes section: a Spotlight of the hottest
 * published Episodes to click straight into, plus reference links and a link to browse all Episodes.
 */
export async function EpisodesSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing' });
  const cards = await episodeCards(locale);
  return (
    <section id="episodes" className="relative">
      <div className="mx-auto max-w-6xl space-y-16 px-6 py-24 sm:py-32">
        <EpisodesHeader title={t('episodesSectionTitle')} subtitle={t('episodesSectionSubtitle')} />
        <div>
          <PartHeading>{t('episodeOverview.spotlightTitle')}</PartHeading>
          <EpisodeSpotlight cards={cards} locale={locale} labels={cardLabels(t)} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
          <ReferenceLinks locale={locale} t={t} />
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
