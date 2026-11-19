import type { TextRange } from '@/episodes/lib/caption-emphasis.pure';
import { ENTRANCE_MILLISECONDS, typewriterSchedule } from '@/episodes/lib/typewriter.pure';
import { cn } from '@/shared/lib/utils';
import { Fragment, type ReactNode } from 'react';
import { ContextMarker } from './context-marker';
import type { SlideEntrance } from './slide';
import { eyebrowLength, SlideEyebrow, type EyebrowText } from './slide-eyebrow';
import type { CaptionNote } from './slide-header-text';
import { HeroTitle, SlideTitle } from './slide-master';
import { SURFACE_MUTED_TEXT } from './surface';
import { typedLength, TypedText } from './typed-text';

function scheduleOf(entrance: SlideEntrance, seed: string, lengths: readonly number[]) {
  if (entrance !== 'typewriter')
    return { delays: lengths.map(() => undefined), ends: lengths.map(() => ENTRANCE_MILLISECONDS) };
  const delays = typewriterSchedule(lengths, seed);
  const ends = delays.map(
    (_, index) => delays.slice(index + 1).find((part) => part.length > 0)?.[0] ?? ENTRANCE_MILLISECONDS,
  );
  return { delays, ends };
}

export interface SlideHeaderProps {
  readonly seed: string;
  // decision: FE-002 §4
  readonly level: 'h1' | 'h2' | 'h3';
  readonly title: string;
  readonly caption?: string;
  readonly captionEmphasis?: readonly TextRange[];
  readonly captionNote?: CaptionNote;
  readonly captionNotes?: readonly CaptionNote[];
  readonly eyebrow?: EyebrowText;
  readonly action?: ReactNode;
  readonly entrance?: SlideEntrance;
  readonly className?: string;
  readonly leading?: ReactNode;
  readonly children?: ReactNode;
}

function Heading({ level, children }: { level: SlideHeaderProps['level']; children: ReactNode }) {
  if (level === 'h1') return <HeroTitle data-target="title">{children}</HeroTitle>;
  return (
    <SlideTitle as={level} data-target="title">
      {children}
    </SlideTitle>
  );
}

interface TitleGroupProps extends Pick<
  SlideHeaderProps,
  'level' | 'title' | 'caption' | 'captionEmphasis' | 'captionNote' | 'captionNotes'
> {
  readonly delays: readonly (readonly number[] | undefined)[];
  readonly ends: readonly number[];
}

function CaptionMarkers({ markers }: { readonly markers: readonly CaptionNote[] }) {
  return markers.map((marker, index) => (
    <Fragment key={`${marker.note}-${index}`}>
      {index === 0 && '\u00a0'}
      <ContextMarker note={marker.note} label={marker.label} placement="beside" className="inline-grid align-middle" />
    </Fragment>
  ));
}

function TitleGroup({
  level,
  title,
  caption,
  captionEmphasis,
  captionNote,
  captionNotes,
  delays,
  ends,
}: TitleGroupProps) {
  const markers = captionNote ? [captionNote] : (captionNotes ?? []);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-(--space-header-tight)">
      <Heading level={level}>
        <TypedText text={title} delaysMilliseconds={delays[1]} caretMovesOnAtMilliseconds={ends[1]} />
      </Heading>
      {caption && (
        <p data-target="caption" className={cn('text-body', SURFACE_MUTED_TEXT)}>
          <TypedText
            text={caption}
            delaysMilliseconds={delays[2]}
            caretMovesOnAtMilliseconds={ends[2]}
            emphasis={captionEmphasis}
          />
          <CaptionMarkers markers={markers} />
        </p>
      )}
    </div>
  );
}

function TitleRow({ action, children }: { action: ReactNode; children: ReactNode }) {
  if (!action) return children;
  return (
    <div data-slot="slide-header-row" className="flex flex-wrap items-start gap-x-6 gap-y-(--space-header-tight)">
      {children}
      {action}
    </div>
  );
}

// decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
export function SlideHeader({
  seed,
  level,
  title,
  caption,
  captionEmphasis,
  captionNote,
  captionNotes,
  eyebrow,
  action,
  entrance = 'typewriter',
  ...rest
}: SlideHeaderProps) {
  const lengths = [eyebrow ? eyebrowLength(eyebrow) : 0, typedLength(title), typedLength(caption ?? '')];
  const { delays, ends } = scheduleOf(entrance, seed, lengths);
  return (
    <div
      data-slot="slide-header"
      data-entrance={entrance}
      className={cn('flex flex-col gap-(--space-header) pt-16 pb-(--space-header) md:pt-24', rest.className)}
    >
      {eyebrow && <SlideEyebrow eyebrow={eyebrow} delays={delays[0]} next={ends[0]} />}
      {rest.leading}
      <TitleRow action={action}>
        <TitleGroup {...{ level, title, caption, captionEmphasis, captionNote, captionNotes, delays, ends }} />
      </TitleRow>
      {rest.children}
    </div>
  );
}
