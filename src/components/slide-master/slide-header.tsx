import type { TextRange } from '@/lib/caption-emphasis.pure';
import { ENTRANCE_MS, typewriterSchedule } from '@/lib/typewriter.pure';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import type { SlideEntrance } from './slide';
import { eyebrowLength, SlideEyebrow, type EyebrowText } from './slide-eyebrow';
import { HeroTitle, SlideTitle } from './slide-master';
import { typedLength, TypedText } from './typed-text';

/** Each part's delays (Eyebrow, title, caption), and when the part after each one starts typing. */
function scheduleOf(entrance: SlideEntrance, seed: string, lengths: readonly number[]) {
  if (entrance !== 'typewriter') return { delays: lengths.map(() => undefined), ends: lengths.map(() => ENTRANCE_MS) };
  const delays = typewriterSchedule(lengths, seed);
  const ends = delays.map((_, index) => delays.slice(index + 1).find((part) => part.length > 0)?.[0] ?? ENTRANCE_MS);
  return { delays, ends };
}

export interface SlideHeaderProps {
  /** The Slide's id: seeds the typing pace, so it is the same on every load. */
  readonly seed: string;
  /** The heading level the Slide's position gives it (FE-002 §4); `h1` is the Title slide's. */
  readonly level: 'h1' | 'h2' | 'h3';
  readonly title: string;
  readonly caption?: string;
  /** The caption's `<b>` runs, set off in `primary` semibold. */
  readonly captionEmphasis?: readonly TextRange[];
  /** Page Slides only; a section slide and the Title slide have none. */
  readonly eyebrow?: EyebrowText;
  readonly entrance?: SlideEntrance;
  readonly className?: string;
  /** Rendered after the caption, e.g. the Title slide's talk launcher. */
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

/**
 * The Slide header (design-ADR-0012): Eyebrow, title and caption, rendered by the
 * Slide wrapper above the Scene. A server component: the typewriter is CSS
 * over the spans split here, so no client code runs for it. The caption sits
 * close under the title and the Eyebrow further above, so title and caption
 * read as one.
 */
export function SlideHeader({
  seed,
  level,
  title,
  caption,
  captionEmphasis,
  eyebrow,
  entrance = 'typewriter',
  ...rest
}: SlideHeaderProps) {
  const lengths = [eyebrow ? eyebrowLength(eyebrow) : 0, typedLength(title), typedLength(caption ?? '')];
  const { delays, ends } = scheduleOf(entrance, seed, lengths);
  return (
    <div data-slot="slide-header" data-entrance={entrance} className={cn('pt-16 md:pt-24', rest.className)}>
      {eyebrow && <SlideEyebrow eyebrow={eyebrow} delays={delays[0]} next={ends[0]} />}
      <Heading level={level}>
        <TypedText text={title} delays={delays[1]} next={ends[1]} />
      </Heading>
      {caption && (
        <p data-target="caption" className="mt-2 text-body text-balance text-muted-foreground md:max-w-[70%]">
          <TypedText text={caption} delays={delays[2]} next={ends[2]} emphasis={captionEmphasis} />
        </p>
      )}
      {rest.children}
    </div>
  );
}
