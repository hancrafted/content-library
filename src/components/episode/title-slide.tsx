import { SlideCaption, SlideFrame, SlideTitle } from './slide-master';
import { SlideWrapper } from './slide-wrapper';

/**
 * The Episode's opening slide and the page's only `h1` (FE-002). Rendered by
 * `EpisodePageContainer`, never by a page file, and not listed in the table
 * of contents. The Episode's recording joins it once the video player lands.
 */
export function TitleSlide({ title, caption }: { title: string; caption?: string }) {
  return (
    <SlideWrapper data-slot="title-slide">
      <SlideFrame className="justify-center">
        <SlideTitle as="h1">{title}</SlideTitle>
        {caption && <SlideCaption>{caption}</SlideCaption>}
      </SlideFrame>
    </SlideWrapper>
  );
}
