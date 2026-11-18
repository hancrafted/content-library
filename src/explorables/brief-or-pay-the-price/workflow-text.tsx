import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

const CAPTION_PIXELS = 14;

interface SizedTextProps {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly className: string;
  readonly anchor?: 'start' | 'middle' | 'end';
  readonly turn?: number;
  readonly children: ReactNode;
}

export function SizedText({ x, y, size, className, anchor = 'middle', turn = 0, children }: SizedTextProps) {
  const rotate = turn === 0 ? '' : ` rotate(${turn})`;
  return (
    <g transform={`translate(${x} ${y})${rotate} scale(${size / CAPTION_PIXELS})`}>
      <text textAnchor={anchor} className={cn('text-caption', className)}>
        {children}
      </text>
    </g>
  );
}
