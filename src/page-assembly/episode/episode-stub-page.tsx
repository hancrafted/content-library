import { episodeRoute, isEpisodesPathSlug } from '@/content-store/catalogue/record-routes';
import type { Locale } from '@/shared/lib/locale.pure';
import { localizePath } from '@/shared/lib/locale.pure';
import { notFound } from 'next/navigation';

export function EpisodeStubPage({ slug, locale }: { slug: string; locale: Locale }) {
  if (!isEpisodesPathSlug(slug)) notFound();
  const target = localizePath(episodeRoute(slug), locale);

  return (
    <main
      data-testid="episode-stub-page"
      className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center"
    >
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <p className="text-body text-muted-foreground">
        Redirecting to{' '}
        <a href={localizePath(episodeRoute(slug), locale)} className="text-foreground underline">
          {target}
        </a>
        ...
      </p>
    </main>
  );
}
