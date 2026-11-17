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
    className: hero === undefined ? 'my-auto pb-16 md:pb-24' : 'mt-auto',
    children: (
      <>
        <EventTime time={props.time} />
        {launcher}
      </>
    ),
  };
}

// decision: FE-002 §1
// decision: docs/adr/0012-slide-header-and-play-once-motion.md
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
