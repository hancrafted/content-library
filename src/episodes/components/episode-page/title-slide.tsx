import type { HeaderMode, PageTone, SlideEntrance } from '@/episodes/components/slide-master/slide';
import { HeroTitle, SlideBackdrop, SlideCaption, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import type { ReactNode } from 'react';
import { SlideWrapper } from './slide-wrapper';
import { TalkLauncher, type RecordingLanguage, type TalkPlayerLabels } from './talk-player.client';
import { TitleInk } from './title-ink.client';
import { TitleTone } from './title-tone.client';

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
  /** An unlisted Episode's Event recording: the language spoken in it, labelled on the launcher before play. */
  recording?: RecordingLanguage;
  /** On an Event-scoped Episode page, the Event's time as the venue writes it, "17:00–19:00 CET"; it follows the title. */
  time?: string;
  /** The record's declared tone (FE-004 §5.4): the Slide carries it and marks the page while it is active. */
  tone?: PageTone;
  /** With a tone, the first page Slide's id: the ink transition at the Title slide's foot bleeds into it. */
  inkTarget?: string;
  /** On an Episode with authored headers, the short names the Title slide's notes target; only these carry a `data-target`. The Slide header marks both. */
  targets?: readonly TitleTarget[];
}

/** The Event's time, under the title and caption; nothing off an Event or when the Event has none. */
function EventTime({ time }: { time: string | undefined }) {
  if (time === undefined) return null;
  return (
    <p data-event-time className="text-caption font-medium text-muted-foreground">
      {time}
    </p>
  );
}

/** The Title slide as an Episode with authored Scene headers renders it: the `h1` and caption over the hero Scene or the glow. */
/** The page tone mark, when the record declares a tone. */
function ToneMark({ tone }: { tone: TitleSlideProps['tone'] }) {
  return tone ? <TitleTone tone={tone} /> : null;
}

/** The ink transition into the first page Slide, which a toned Title slide ends in. */
function ToneInk({ tone, target }: { tone: TitleSlideProps['tone']; target: string | undefined }) {
  return tone && target ? <TitleInk targetId={target} /> : null;
}

function AuthoredTitleSlide({
  title,
  caption,
  hero,
  launcher,
  targets,
  time,
  tone,
  inkTarget,
}: TitleSlideProps & { launcher: ReactNode }) {
  const targetOf = (name: TitleTarget) => (targets?.includes(name) ? { 'data-target': name } : {});
  return (
    <SlideWrapper id={TITLE_ANCHOR} data-slot="title-slide" data-tone={tone}>
      <ToneMark tone={tone} />
      {hero ?? <HeroGlow />}
      <ToneInk tone={tone} target={inkTarget} />
      <SlideFrame className="justify-center">
        <HeroTitle {...targetOf('title')}>{title}</HeroTitle>
        {caption && <SlideCaption {...targetOf('caption')}>{caption}</SlideCaption>}
        <EventTime time={time} />
        {launcher}
      </SlideFrame>
    </SlideWrapper>
  );
}

/** The shared header the Title slide hands its wrapper: it types in like every Slide header (design-ADR-0012). */
function sharedHeaderOf(props: TitleSlideProps, launcher: ReactNode) {
  const { hero, entrance } = props;
  return {
    seed: TITLE_ANCHOR,
    level: 'h1' as const,
    title: props.title,
    caption: props.caption,
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
      data-tone={props.tone}
      mode="shared"
      header={header}
      scene="hug"
    >
      <ToneMark tone={props.tone} />
      {hero ?? <HeroGlow />}
      <ToneInk tone={props.tone} target={props.inkTarget} />
    </SlideWrapper>
  );
}
