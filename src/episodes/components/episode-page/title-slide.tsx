import type { HeaderMode, SlideEntrance } from '@/episodes/components/slide-master/slide';
import { HeroTitle, SlideBackdrop, SlideCaption, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import type { ReactNode } from 'react';
import type { ResolvedSlideTransition } from '../slide-master/slide-presentation';
import { fillsHeaderBand } from './episode-page-container.pure';
import type { TitleAppearance } from './record-content';
import { SlideWrapper } from './slide-wrapper';
import { TalkLauncher, type RecordingLanguage, type TalkPlayerLabels } from './talk-player.client';
import { TitleInk } from './title-ink.client';
import { TitleTone } from './title-tone.client';

export type TitleTarget = 'title' | 'caption';

export function isTitleTarget(name: string): name is TitleTarget {
  return name === 'title' || name === 'caption';
}

function HeroGlow() {
  return (
    <SlideBackdrop mobile>
      <div className="hero-glow absolute inset-0 text-primary" />
      <div className="hero-glow hero-glow--accent absolute inset-0 text-accent" />
    </SlideBackdrop>
  );
}

export interface TitleSlideProps {
  transition?: ResolvedSlideTransition;
  appearance: TitleAppearance;
  geometricTone?: boolean;
  title: string;
  caption?: string;
  mode: HeaderMode;
  entrance: SlideEntrance;
  hero?: ReactNode;
  youtubeId?: string;
  talkLabels?: TalkPlayerLabels;
  recording?: RecordingLanguage;
  time?: string;
  notice?: ReactNode;
  targets?: readonly TitleTarget[];
}

function EventTime({ time }: { time: string | undefined }) {
  if (time === undefined) return null;
  return (
    <p data-event-time className="text-caption font-medium text-muted-foreground">
      {time}
    </p>
  );
}

/** Title-only navigation policy, independent of configured surface sampling. */
function ToneMark({ appearance, geometricTone }: Pick<TitleSlideProps, 'appearance' | 'geometricTone'>) {
  return appearance.tone === 'inverse' ? <TitleTone tone={appearance.tone} geometricTone={geometricTone} /> : null;
}

function headerBandOf(appearance: TitleAppearance) {
  return fillsHeaderBand(appearance) ? '' : undefined;
}

function ToneInk({ target }: { target: string | undefined }) {
  return target ? <TitleInk targetId={target} /> : null;
}

function AuthoredTitleSlide(props: TitleSlideProps & { launcher: ReactNode }) {
  const targetOf = (name: TitleTarget) => (props.targets?.includes(name) ? { 'data-target': name } : {});
  return (
    <SlideWrapper
      id={TITLE_ANCHOR}
      data-slot="title-slide"
      data-tone={props.appearance.legacyTone}
      data-header-band={headerBandOf(props.appearance)}
      presentation={props.appearance.presentation}
      transition={props.transition}
    >
      <ToneMark {...props} />
      {props.hero ?? <HeroGlow />}
      <ToneInk target={props.appearance.inkTarget} />
      <SlideFrame className="justify-center">
        {props.notice && <div className="mb-6">{props.notice}</div>}
        <HeroTitle {...targetOf('title')}>{props.title}</HeroTitle>
        {props.caption && <SlideCaption {...targetOf('caption')}>{props.caption}</SlideCaption>}
        <EventTime time={props.time} />
        {props.launcher}
      </SlideFrame>
    </SlideWrapper>
  );
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
function sharedHeaderOf(props: TitleSlideProps, launcher: ReactNode) {
  const { hero, entrance } = props;
  return {
    seed: TITLE_ANCHOR,
    level: 'h1' as const,
    title: props.title,
    caption: props.caption,
    leading: props.notice,
    entrance,
    // Without a hero Scene the header sits centred over the glow; with one, header and hero sit together, centred.
    className: hero === undefined ? 'my-auto pb-16 md:pb-24' : 'mt-auto',
    children: (
      <>
        <EventTime time={props.time} />
        {launcher}
      </>
    ),
  };
}

/**
 * The Episode's opening slide and the page's only `h1` (FE-002). Rendered by
 * `EpisodePageContainer`, never by a page file, and not listed in the table
 * of contents. Its wrapper carries the reserved id `top`, which the table of
 * contents heading links to. The Episode's recording joins it when youtubeId is provided, labelled with its
 * language when it is an Event recording.
 *
 * On the shared header it types in like every Slide header on page load
 * (design-ADR-0012), over the record's hero Scene or, without one, the shared glow.
 */
export function TitleSlide(props: TitleSlideProps) {
  const { youtubeId, talkLabels, recording, hero, title } = props;
  const launcher = youtubeId && talkLabels && (
    <TalkLauncher youtubeId={youtubeId} title={title} labels={talkLabels} recording={recording} />
  );
  if (props.mode === 'authored') return <AuthoredTitleSlide {...props} launcher={launcher} />;
  const header = sharedHeaderOf(props, launcher);
  return (
    <SlideWrapper
      id={TITLE_ANCHOR}
      data-slot="title-slide"
      data-tone={props.appearance.legacyTone}
      data-header-band={headerBandOf(props.appearance)}
      mode="shared"
      header={header}
      scene="hug"
      presentation={props.appearance.presentation}
      transition={props.transition}
    >
      <ToneMark {...props} />
      {hero ?? <HeroGlow />}
      <ToneInk target={props.appearance.inkTarget} />
    </SlideWrapper>
  );
}
