import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { SlideCaption, SlideFrame } from './slide-master';

/**
 * A Section's own slide: its heading and an optional caption, vertically
 * centred, or with children below. Pass the kit's `<Title>` as `title`; the
 * caption is the `caption` target.
 */
export function SectionSlide({
  title,
  caption,
  className,
  children,
}: {
  title: ReactNode;
  caption?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <SlideFrame className={cn(!children && 'items-center justify-center text-center', className)}>
      {title}
      {caption && <SlideCaption data-target="caption">{caption}</SlideCaption>}
      {children}
    </SlideFrame>
  );
}
