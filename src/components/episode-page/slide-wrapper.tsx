import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';
import { SlideMount } from './slide-mount.client';

/**
 * The Slide wrapper (FE-009 §3): a server component holding one Slide's
 * mechanics. `EpisodePageContainer` renders it from one record entry and hands
 * it the id from `slideAnchor()` (FE-002 §2); it declares nothing itself.
 *
 * At least viewport height, free to grow with its content, never clipped: no
 * `overflow`, so a tall Slide grows the page and nothing gets an inner
 * scrollbar. It sets no margins or gaps; rhythm belongs to the Content area.
 * Its content sits inside a `SlideMount`, which drops it while the Slide is far.
 */
export function SlideWrapper({ id, className, children, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      id={id}
      data-slide={id}
      className={cn('relative flex min-h-svh w-full scroll-mt-24 flex-col', className)}
      {...props}
    >
      <SlideMount id={id}>{children}</SlideMount>
    </div>
  );
}
