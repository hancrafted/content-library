import type { ReactNode } from 'react';
import { elementId, SlideCaption, SlideFrame, SlideProse, SlideTitle } from './slide-master';

/**
 * A page slide: title and caption up top, one block of prose below. Given the
 * Slide's `anchor`, its elements carry the ids a Speaker note targets (FE-010).
 */
export function BasicPageSlide({
  anchor,
  title,
  caption,
  prose,
}: {
  anchor?: string;
  title: ReactNode;
  caption: ReactNode;
  prose: ReactNode;
}) {
  return (
    <SlideFrame>
      <SlideTitle as="h3" id={elementId(anchor, 'title')}>
        {title}
      </SlideTitle>
      <SlideCaption id={elementId(anchor, 'caption')}>{caption}</SlideCaption>
      <div className="mt-auto pt-10">
        <SlideProse id={elementId(anchor, 'prose')}>{prose}</SlideProse>
      </div>
    </SlideFrame>
  );
}
