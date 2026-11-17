import { Frame } from '@/episodes/components/slide-shared/exhibition/frame';
import { WallLabel } from '@/episodes/components/slide-shared/exhibition/wall-label';
import type { ReactNode } from 'react';
import { PairArt, type PairSlug } from './pair-art';

interface Side {
  readonly title: string;
  readonly detail: string;
  readonly marker?: ReactNode;
}

export interface MirroredExhibitProps {
  readonly slug: PairSlug;
  readonly label: { title: string; era: string; line: string };
  readonly work: Side;
  readonly ai: Side;
  readonly words: { work: string; ai: string; sameMove: string };
  readonly reveal: number;
  readonly target?: string;
}

const SIDE_LABEL = 'text-caption font-semibold tracking-widest uppercase';
const SUBGRID = '@min-[40rem]:grid @min-[40rem]:grid-rows-subgrid';

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
