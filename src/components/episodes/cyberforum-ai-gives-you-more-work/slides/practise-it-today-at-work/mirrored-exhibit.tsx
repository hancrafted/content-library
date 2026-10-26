import { Frame } from '@/components/slide-shared/exhibition/frame';
import { WallLabel } from '@/components/slide-shared/exhibition/wall-label';
import type { ReactNode } from 'react';
import { PairArt, type PairSlug } from './pair-art';

interface Side {
  readonly title: string;
  readonly detail: string;
  /** A Context marker after the title. */
  readonly marker?: ReactNode;
}

export interface MirroredExhibitProps {
  readonly slug: PairSlug;
  readonly label: { title: string; era: string; line: string };
  readonly work: Side;
  readonly ai: Side;
  /** The side labels and the line between them. */
  readonly words: { work: string; ai: string; sameMove: string };
  /** The disclosure step the AI half shows from. */
  readonly reveal: number;
  readonly target?: string;
}

const SIDE_LABEL = 'text-caption font-semibold tracking-widest uppercase';
const SUBGRID = '@min-[40rem]:grid @min-[40rem]:grid-rows-subgrid';

/**
 * One moment at work over its reflection with AI, like a picture over its mirror image: a framed pair split by a
 * "same move" line, its wall label centred under it. From the width three columns fit, each exhibit spans four shared
 * rows (work half, line, AI half, label), so the three frames are one height, their lines sit on one level and the
 * labels are one height. The AI half shows from `reveal`.
 */
export function MirroredExhibit({ slug, label, work, ai, words, reveal, target }: MirroredExhibitProps) {
  return (
    <li data-target={target} className={`focus-group__item flex flex-col @min-[40rem]:row-span-4 ${SUBGRID}`}>
      <Frame className={`flex flex-col @min-[40rem]:row-span-3 ${SUBGRID}`}>
        <div className="flex flex-1 flex-col gap-2 bg-human/10 p-4">
          <p className={`${SIDE_LABEL} text-human`}>{words.work}</p>
          <PairArt slug={slug} side="work" />
          <p className="text-body font-semibold">{work.title}</p>
          <p className="text-caption text-muted-foreground">{work.detail}</p>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2">
          <span className="h-px flex-1 bg-foreground/40" />
          <span className="text-caption text-muted-foreground">{words.sameMove}</span>
          <span className="h-px flex-1 bg-foreground/40" />
        </div>
        <div data-reveal={reveal} className="flex flex-1 flex-col gap-2 bg-ai/[calc(15%*var(--reveal-dim,1))] p-4">
          <p className={`${SIDE_LABEL} text-foreground`}>{words.ai}</p>
          <PairArt slug={slug} side="ai" />
          <p className="flex items-center gap-1 text-body font-semibold">
            {ai.title}
            {ai.marker}
          </p>
          <p className="text-caption text-muted-foreground">{ai.detail}</p>
        </div>
      </Frame>
      <WallLabel title={label.title} era={label.era} line={label.line} className="mt-4" />
    </li>
  );
}
