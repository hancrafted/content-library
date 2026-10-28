import type { HeaderMode } from '@/episodes/components/slide-master/slide';
import { SlideHeader, type SlideHeaderProps } from '@/episodes/components/slide-master/slide-header';
import { cn } from '@/shared/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';
import { SlideMount } from './slide-mount.client';

/** How tall a Slide is at least: a page Slide fills the viewport, a section slide 40% of it (FE-009 §3). */
const MIN_HEIGHT = { page: 'min-h-svh', section: 'min-h-[40svh]' } as const;

export interface SlideWrapperProps extends ComponentPropsWithoutRef<'div'> {
  readonly size?: keyof typeof MIN_HEIGHT;
  /** Who renders the Slide's header; on `shared` the wrapper renders it and plays the entrance once (design-ADR-0012). */
  readonly mode?: HeaderMode;
  /** The Slide header the wrapper renders above the Scene on `shared`; absent for an untitled Slide. */
  readonly header?: SlideHeaderProps;
  /** Under a header, the Scene's frame fills the rest of the Slide (`fill`) or hugs its content (`hug`, the Title slide's hero). */
  readonly scene?: 'fill' | 'hug';
}

/**
 * The Slide wrapper (FE-009 §3): a server component holding one Slide's
 * mechanics. `EpisodePageContainer` renders it from one record entry and hands
 * it the id its position gives it (FE-002 §2) and the Slide header's data; it
 * declares nothing itself.
 *
 * Full width (the Content area pads it with the insets) and `isolate`, so a
 * Backdrop at a negative z-index stays inside its own Slide (FE-009 §3, §8).
 * At least viewport height for a page Slide, 40% of it for a section slide,
 * free to grow with its content, never clipped: no `overflow`, so a tall Slide
 * grows the page and nothing gets an inner scrollbar. It sets no margins or
 * gaps; rhythm belongs to the Content area. Its content sits inside a
 * `SlideMount`, which drops it while the Slide is far: the Slide header first,
 * then the Scene in a `display: contents` box the entrance CSS reaches.
 */
export function SlideWrapper({ id, className, size = 'page', mode = 'authored', ...rest }: SlideWrapperProps) {
  const { header, scene, children, ...props } = rest;
  // A section slide on the shared header is a full-bleed band, so a new Section reads at a glance.
  const band = mode === 'shared' && size === 'section' && 'bg-section-band';
  return (
    <div
      id={id}
      data-slide={id}
      data-size={size}
      className={cn('relative isolate flex w-full scroll-mt-24 flex-col', MIN_HEIGHT[size], band, className)}
      {...props}
    >
      <SlideMount id={id} mode={mode}>
        {mode === 'shared' ? (
          <SharedContent header={header} scene={scene}>
            {children}
          </SharedContent>
        ) : (
          children
        )}
      </SlideMount>
    </div>
  );
}

/** On the shared header: the Slide header, then the Scene in a `display: contents` box the entrance CSS reaches. */
function SharedContent({ header, scene = 'fill', children }: Pick<SlideWrapperProps, 'header' | 'scene' | 'children'>) {
  return (
    <>
      {header && <SlideHeader {...header} />}
      <div data-slot="slide-scene" data-headed={header ? scene : undefined} className="contents">
        {children}
      </div>
    </>
  );
}
