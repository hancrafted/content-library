import { HeroTitle, SlideBackdrop, SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { TITLE_ANCHOR } from '@/lib/episode.pure';
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
  targets = [],
}: {
  title: string;
  caption?: string;
  youtubeId?: string;
  talkLabels?: TalkPlayerLabels;
  /** The short names the Title slide's Speaker notes target (`title`, `caption`); only these elements carry a `data-target`. */
  targets?: readonly string[];
}) {
  const targetOf = (name: string) => (targets.includes(name) ? { 'data-target': name } : {});
  return (
    <SlideWrapper id={TITLE_ANCHOR} data-slot="title-slide">
      <SlideBackdrop mobile>
        <div className="hero-glow absolute inset-0 text-primary" />
        <div className="hero-glow hero-glow--accent absolute inset-0 text-accent" />
      </SlideBackdrop>
      <SlideFrame className="justify-center">
        <HeroTitle {...targetOf('title')}>{title}</HeroTitle>
        {caption && <SlideCaption {...targetOf('caption')}>{caption}</SlideCaption>}
        {youtubeId && talkLabels && <TalkLauncher youtubeId={youtubeId} labels={talkLabels} />}
      </SlideFrame>
    </SlideWrapper>
  );
}
