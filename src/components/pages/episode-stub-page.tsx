import type { Locale } from '@/lib/locale.pure';
import { localizePath } from '@/lib/locale.pure';
import { episodeRoute, isEpisodeSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';

/**
 * Static stub for legacy /episode/<slug> paths (#85).
 * Forwards with <meta http-equiv="refresh"> to /episodes/<slug> and declares the new URL canonical.
 */
export function EpisodeStubPage({ slug, locale }: { slug: string; locale: Locale }) {
  if (!isEpisodeSlug(slug)) notFound();
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
