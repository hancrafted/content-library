import type { ReactNode } from 'react';
import { SlideCaption, SlideFrame, SlideProse, SlideTitle } from './slide-master';

export interface SlideColumn {
  /** The column's stable slug, never its position; also the target a Speaker note names it by. */
  slug: string;
  title: ReactNode;
  prose: ReactNode;
}

function Column({ column }: { column: SlideColumn }) {
  return (
    <div data-target={column.slug} data-column={column.slug} className="flex flex-col gap-3 border-t pt-4">
      <SlideTitle as="h4">{column.title}</SlideTitle>
      <SlideProse>{column.prose}</SlideProse>
    </div>
  );
}

/**
 * A page slide: title and caption up top, exactly three columns below. Pass
 * the kit's `<Title>` as `title`; `caption` and each column's slug are targets.
 */
export function ThreeColumnSlide({
  title,
  caption,
  columns,
}: {
  title: ReactNode;
  caption: ReactNode;
  columns: readonly [SlideColumn, SlideColumn, SlideColumn];
}) {
  return (
    <SlideFrame>
      {title}
      <SlideCaption data-target="caption">{caption}</SlideCaption>
      <div className="mt-auto grid gap-8 pt-10 md:grid-cols-3">
        {columns.map((column) => (
          <Column key={column.slug} column={column} />
        ))}
      </div>
    </SlideFrame>
  );
}
