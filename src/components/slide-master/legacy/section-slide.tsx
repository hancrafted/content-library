/* Legacy layout for Episodes not yet written as Slide files (it takes `anchor` and emits ids). Delete with the last legacy Episode. */
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { elementId, SlideCaption, SlideFrame, SlideTitle } from '../slide-master';

/** A Section's own slide: its heading and an optional caption, vertically centred or with children. */
export function SectionSlide({
  anchor,
  title,
  caption,
  className,
  children,
}: {
  anchor?: string;
  title: ReactNode;
  caption?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <SlideFrame className={cn(!children && 'items-center justify-center text-center', className)}>
      <SlideTitle as="h2" id={elementId(anchor, 'title')}>
        {title}
      </SlideTitle>
      {caption && <SlideCaption id={elementId(anchor, 'caption')}>{caption}</SlideCaption>}
      {children}
    </SlideFrame>
  );
}
