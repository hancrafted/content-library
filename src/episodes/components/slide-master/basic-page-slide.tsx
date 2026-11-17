import type { ReactNode } from 'react';
import { SlideCaption, SlideFrame, SlideProse } from './slide-master';

export function BasicPageSlide({ title, caption, prose }: { title: ReactNode; caption: ReactNode; prose: ReactNode }) {
  return (
    <SlideFrame>
      {title}
      <SlideCaption data-target="caption">{caption}</SlideCaption>
      <div className="mt-auto pt-10">
        <SlideProse data-target="prose">{prose}</SlideProse>
      </div>
    </SlideFrame>
  );
}
