import type { HeaderMode, SlideEntrance } from '@/components/slide-master/slide';
import { HeroTitle, SlideBackdrop, SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { TITLE_ANCHOR } from '@/lib/episode.pure';
import type { ReactNode } from 'react';
import { SlideWrapper } from './slide-wrapper';
import { TalkLauncher, type TalkPlayerLabels } from './talk-player.client';

/** The elements of the Title slide a Speaker note can target. */
export type TitleTarget = 'title' | 'caption';

export function isTitleTarget(name: string): name is TitleTarget {
  return name === 'title' || name === 'caption';
}

/** The shared glow behind a Title slide with no authored hero Scene. */
function HeroGlow() {
  return (
    <SlideBackdrop mobile>
      <div className="hero-glow absolute inset-0 text-primary" />
      <div className="hero-glow hero-glow--accent absolute inset-0 text-accent" />
    </SlideBackdrop>
  );
}

export interface TitleSlideProps {
  title: string;
  caption?: string;
  /** Who renders the header: on `shared` the Title slide types its `h1` and caption in with `entrance`. */
  mode: HeaderMode;
  entrance: SlideEntrance;
  /** The record's authored hero Scene (`title`); absent, the shared glow. */
  hero?: ReactNode;
  youtubeId?: string;
  talkLabels?: TalkPlayerLabels;
  /** On an Episode with authored headers, the short names the Title slide's notes target; only these carry a `data-target`. The Slide header marks both. */
  targets?: readonly TitleTarget[];
}

/** The Title slide as an Episode with authored Scene headers renders it: the `h1` and caption over the hero Scene or the glow. */
function AuthoredTitleSlide({ title, caption, hero, launcher, targets }: TitleSlideProps & { launcher: ReactNode }) {
  const targetOf = (name: TitleTarget) => (targets?.includes(name) ? { 'data-target': name } : {});
  return (
    <SlideWrapper id={TITLE_ANCHOR} data-slot="title-slide">
      {hero ?? <HeroGlow />}
      <SlideFrame className="justify-center">
        <HeroTitle {...targetOf('title')}>{title}</HeroTitle>
        {caption && <SlideCaption {...targetOf('caption')}>{caption}</SlideCaption>}
        {launcher}
      </SlideFrame>
    </SlideWrapper>
  );
}

/**
 * The Episode's opening slide and the page's only `h1` (FE-002). Rendered by
 * `EpisodePageContainer`, never by a page file, and not listed in the table
 * of contents. Its wrapper carries the reserved id `top`, which the table of
 * contents heading links to. The Episode's recording joins it when youtubeId is provided.
 *
 * On the shared header it types in like every Slide header on page load
 * (FE-012), over the record's hero Scene or, without one, the shared glow.
 */
export function TitleSlide(props: TitleSlideProps) {
  const { youtubeId, talkLabels, entrance, hero } = props;
  const launcher = youtubeId && talkLabels && <TalkLauncher youtubeId={youtubeId} labels={talkLabels} />;
  if (props.mode === 'authored') return <AuthoredTitleSlide {...props} launcher={launcher} />;
  const header = {
    seed: TITLE_ANCHOR,
    level: 'h1' as const,
    title: props.title,
    caption: props.caption,
    entrance,
    // Without a hero Scene the header sits centred over the glow; with one, header and hero sit together, centred.
    className: hero === undefined ? 'my-auto pb-16 md:pb-24' : 'mt-auto',
    children: launcher,
  };
  return (
    <SlideWrapper id={TITLE_ANCHOR} data-slot="title-slide" mode="shared" header={header} scene="hug">
      {hero ?? <HeroGlow />}
    </SlideWrapper>
  );
}
