import { SlideCaption, SlideFrame, SlideTitle } from '@/components/slide-master/slide-master';
import { titleAnchor } from '@/lib/episode.pure';
import { SlideWrapper } from './slide-wrapper';
import { TalkLauncher, type TalkPlayerLabels } from './talk-player.client';

/**
 * The Episode's opening slide and the page's only `h1` (FE-002). Rendered by
 * `EpisodePageContainer`, never by a page file, and not listed in the table
 * of contents. Its wrapper carries the reserved id `top`, which the table of
 * contents heading links to. The Episode's recording joins it when youtubeId is provided.
 */
export function TitleSlide({
  title,
  caption,
  youtubeId,
  talkLabels,
}: {
  title: string;
  caption?: string;
  youtubeId?: string;
  talkLabels?: TalkPlayerLabels;
}) {
  return (
    <SlideWrapper id={titleAnchor()} data-slot="title-slide">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="hero-glow absolute inset-0 text-primary" />
        <div className="hero-glow hero-glow--accent absolute inset-0 text-accent" />
      </div>
      <SlideFrame className="justify-center">
        <SlideTitle as="h1">{title}</SlideTitle>
        {caption && <SlideCaption>{caption}</SlideCaption>}
        {youtubeId && talkLabels && <TalkLauncher youtubeId={youtubeId} labels={talkLabels} />}
      </SlideFrame>
    </SlideWrapper>
  );
}
