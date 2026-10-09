/* Legacy layout for Episodes not yet written as Slide files (it takes `anchor` and emits ids). Delete with the last legacy Episode. */
import type { ReactNode } from 'react';
import { elementId, SlideCaption, SlideFrame, SlideProse, SlideTitle } from '../slide-master';

export interface SlideColumn {
  /** The column's stable slug, never its position. */
  slug: string;
  title: ReactNode;
  prose: ReactNode;
}

function Column({ id, column }: { id: string | undefined; column: SlideColumn }) {
  return (
    <div id={id} data-column={column.slug} className="flex flex-col gap-3 border-t pt-4">
      <SlideTitle as="h4">{column.title}</SlideTitle>
      <SlideProse>{column.prose}</SlideProse>
    </div>
  );
}

/** A page slide: title and caption up top, exactly three columns below. Given `anchor`, elements carry note-target ids. */
export function ThreeColumnSlide({
  anchor,
  title,
  caption,
  columns,
}: {
  anchor?: string;
  title: ReactNode;
  caption: ReactNode;
  columns: readonly [SlideColumn, SlideColumn, SlideColumn];
}) {
  return (
    <SlideFrame>
      <SlideTitle as="h3" id={elementId(anchor, 'title')}>
        {title}
      </SlideTitle>
      <SlideCaption id={elementId(anchor, 'caption')}>{caption}</SlideCaption>
      <div className="mt-auto grid gap-8 pt-10 md:grid-cols-3">
        {columns.map((column) => (
          <Column key={column.slug} id={elementId(anchor, column.slug)} column={column} />
        ))}
      </div>
    </SlideFrame>
  );
}
