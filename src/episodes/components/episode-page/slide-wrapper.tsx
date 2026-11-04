import type { HeaderMode } from '@/episodes/components/slide-master/slide';
import { SlideHeader, type SlideHeaderProps } from '@/episodes/components/slide-master/slide-header';
import { cn } from '@/shared/lib/utils';
import { Fragment, type ComponentPropsWithoutRef } from 'react';
import { SlideBackdrop } from '../slide-master/slide-master';
import type { ResolvedSlideTransition, SlidePresentation } from '../slide-master/slide-presentation';
import { SlideIdentity, SlideMount } from './slide-mount.client';
import styles from './slide-presentation.module.css';
import { SlideTransition } from './slide-transition';

/** How tall a Slide is at least: a page Slide fills the viewport, a section slide 40% of it (FE-009 §3). */
const MIN_HEIGHT = { page: 'min-h-svh', section: 'min-h-[40svh]' } as const;

export interface SlideWrapperProps extends ComponentPropsWithoutRef<'div'> {
  readonly transition?: ResolvedSlideTransition;
  readonly presentation?: SlidePresentation;
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
  const { header, scene, children, presentation, transition, style, ...props } = rest;
  // A section slide on the shared header is a full-bleed band, so a new Section reads at a glance.
  const frameClass = wrapperClass(mode, size, presentation);
  return (
    <div
      id={id}
      data-slide={id}
      data-size={size}
      data-surface-tone={surfaceTone(presentation)}
      data-surface-edge={transition ? true : undefined}
      className={cn(frameClass, className)}
      style={{ ...presentation?.style, ...style }}
      {...props}
    >
      <WrapperLayers
        id={id}
        mode={mode}
        presentation={presentation}
        transition={transition}
        header={header}
        scene={scene}
      >
        {children}
      </WrapperLayers>
    </div>
  );
}

function WrapperLayers({
  id,
  mode = 'authored',
  presentation,
  transition,
  header,
  scene,
  children,
}: SlideWrapperProps) {
  const Provider = presentation?.Provider ?? Fragment;
  return (
    <Provider>
      <SurfaceLayers id={id} presentation={presentation} />
      <SlideMount id={id} mode={mode} className={primaryClass(presentation, transition)}>
        {mode === 'shared' ? (
          <SharedContent header={header} scene={scene}>
            {children}
          </SharedContent>
        ) : (
          children
        )}
      </SlideMount>
      {transition && <SlideTransition edge={transition} />}
      <FrontLayer id={id} presentation={presentation} />
    </Provider>
  );
}

function primaryClass(presentation?: SlidePresentation, transition?: ResolvedSlideTransition) {
  return presentation || transition ? styles.primary : undefined;
}

function wrapperClass(mode: HeaderMode, size: keyof typeof MIN_HEIGHT, presentation?: SlidePresentation) {
  const band = mode === 'shared' && size === 'section' && 'bg-section-band';
  return cn(
    'relative isolate flex w-full scroll-mt-24 flex-col',
    MIN_HEIGHT[size],
    band,
    presentation && styles.configured,
  );
}

function surfaceTone(presentation: SlidePresentation | undefined) {
  return presentation ? (presentation.tone ?? 'normal') : undefined;
}

function SurfaceLayers({ id, presentation }: Pick<SlideWrapperProps, 'id' | 'presentation'>) {
  if (!presentation) return null;
  return (
    <>
      <div aria-hidden="true" data-slot="slide-surface" className={styles.surface} />
      <RearLayer id={id} presentation={presentation} />
    </>
  );
}

function RearLayer({ id, presentation }: Pick<SlideWrapperProps, 'id' | 'presentation'>) {
  return presentation?.rear ? (
    <SlideIdentity id={id}>
      <div
        aria-hidden="true"
        inert
        className={cn(styles.decoration, styles.rear)}
        data-mobile={presentation.rearMobile || undefined}
      >
        <SlideBackdrop mobile={presentation.rearMobile}>{presentation.rear}</SlideBackdrop>
      </div>
    </SlideIdentity>
  ) : null;
}

function FrontLayer({ id, presentation }: Pick<SlideWrapperProps, 'id' | 'presentation'>) {
  return presentation?.front ? (
    <SlideIdentity id={id}>
      <div aria-hidden="true" inert data-slot="slide-front" className={cn(styles.decoration, styles.front)}>
        {presentation.front}
      </div>
    </SlideIdentity>
  ) : null;
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
