import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import { externalHref } from '@/lib/external-link.pure';

/** The strings the video link reads: its accessible name and the new-tab notice (FE-003 §2.2). */
export interface VideoLabels {
  readonly watchVideo: string;
  readonly newTab: string;
}

/**
 * The Episode's video as a second link on its card, raised above the card's
 * stretched title link so it stays its own target. Drawn only when the card has a video.
 */
export function YoutubeLink({ card, labels }: { card: EpisodeCard; labels: VideoLabels }) {
  if (card.youtubeUrl === undefined) return null;
  return (
    <a
      href={externalHref(card.youtubeUrl)}
      target="_blank"
      rel="noopener noreferrer"
      data-episode-video
      className="relative z-20 -m-2.5 inline-flex size-11 items-center justify-center rounded-full text-youtube transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.8 15.2V8.8l5.9 3.2-5.9 3.2Z" />
      </svg>
      <span className="sr-only">
        {labels.watchVideo} ({labels.newTab})
      </span>
    </a>
  );
}
