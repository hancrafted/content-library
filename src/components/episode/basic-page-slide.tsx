import type { ReactNode } from 'react';
import { SlideCaption, SlideFrame, SlideProse, SlideTitle } from './slide-master';

/** A page slide: title and caption up top, one block of prose below. */
export function BasicPageSlide({ title, caption, prose }: { title: ReactNode; caption: ReactNode; prose: ReactNode }) {
  return (
    <SlideFrame>
      <SlideTitle as="h3">{title}</SlideTitle>
      <SlideCaption>{caption}</SlideCaption>
      <div className="mt-auto pt-10">
        <SlideProse>{prose}</SlideProse>
      </div>
    </SlideFrame>
  );
}
