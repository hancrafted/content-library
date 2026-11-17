import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { SlideCaption, SlideFrame } from './slide-master';

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
