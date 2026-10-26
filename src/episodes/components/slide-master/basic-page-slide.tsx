import type { ReactNode } from 'react';
import { SlideCaption, SlideFrame, SlideProse } from './slide-master';

/**
 * A page slide: title and caption up top, one block of prose below. Pass the
 * kit's `<Title>` as `title`; `caption` and `prose` are the targets a Speaker
 * note can name (FE-010).
 */
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
