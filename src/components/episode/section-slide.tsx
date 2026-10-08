import type { ReactNode } from 'react';
import { elementId, SlideCaption, SlideFrame, SlideTitle } from './slide-master';

/** A Section's own slide: its heading and an optional caption, vertically centred. */
export function SectionSlide({ anchor, title, caption }: { anchor?: string; title: ReactNode; caption?: ReactNode }) {
  return (
    <SlideFrame className="items-center justify-center text-center">
      <SlideTitle as="h2" id={elementId(anchor, 'title')}>
        {title}
      </SlideTitle>
      {caption && <SlideCaption id={elementId(anchor, 'caption')}>{caption}</SlideCaption>}
    </SlideFrame>
  );
}
