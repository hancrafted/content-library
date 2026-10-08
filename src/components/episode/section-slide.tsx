import type { ReactNode } from 'react';
import { SlideCaption, SlideFrame, SlideTitle } from './slide-master';

/** A Section's own slide: its heading and an optional caption, vertically centred. */
export function SectionSlide({ title, caption }: { title: ReactNode; caption?: ReactNode }) {
  return (
    <SlideFrame className="items-center justify-center text-center">
      <SlideTitle as="h2">{title}</SlideTitle>
      {caption && <SlideCaption>{caption}</SlideCaption>}
    </SlideFrame>
  );
}
