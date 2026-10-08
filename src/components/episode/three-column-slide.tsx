import type { ReactNode } from 'react';
import { SlideCaption, SlideFrame, SlideProse, SlideTitle } from './slide-master';

export interface SlideColumn {
  /** The column's stable slug, never its position. */
  slug: string;
  title: ReactNode;
  prose: ReactNode;
}

/** A page slide: title and caption up top, exactly three columns below. */
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
      <SlideTitle as="h3">{title}</SlideTitle>
      <SlideCaption>{caption}</SlideCaption>
      <div className="mt-auto grid gap-8 pt-10 md:grid-cols-3">
        {columns.map((column) => (
          <div key={column.slug} data-column={column.slug} className="flex flex-col gap-3 border-t pt-4">
            <SlideTitle as="h4">{column.title}</SlideTitle>
            <SlideProse>{column.prose}</SlideProse>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
