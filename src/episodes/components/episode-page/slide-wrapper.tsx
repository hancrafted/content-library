import type { HeaderMode } from '@/episodes/components/slide-master/slide';
import { SlideHeader, type SlideHeaderProps } from '@/episodes/components/slide-master/slide-header';
import { cn } from '@/shared/lib/utils';
import { Fragment, type ComponentPropsWithoutRef } from 'react';
import { SlideBackdrop } from '../slide-master/slide-master';
import type { ResolvedSlideTransition, SlidePresentation } from '../slide-master/slide-presentation';
import { SlideIdentity, SlideMount } from './slide-mount.client';
import styles from './slide-presentation.module.css';
import { SlideTransition } from './slide-transition';

// decision: FE-009 §3
const MIN_HEIGHT = { page: 'min-h-svh', section: 'min-h-[40svh]' } as const;

export interface SlideWrapperProps extends ComponentPropsWithoutRef<'div'> {
  readonly transition?: ResolvedSlideTransition;
  readonly presentation?: SlidePresentation;
  readonly size?: keyof typeof MIN_HEIGHT;
  readonly mode?: HeaderMode;
  readonly header?: SlideHeaderProps;
  readonly scene?: 'fill' | 'hug';
}

// decision: FE-009 §3
// decision: FE-002 §2
// decision: FE-009 §8
export function SlideWrapper({ id, className, size = 'page', mode = 'authored', ...rest }: SlideWrapperProps) {
  const { header, scene, children, presentation, transition, style, ...props } = rest;
  const frameClass = wrapperClass(mode, size, presentation);
  return (
    <div
      id={id}
      data-slide={id}
      data-size={size}
      data-inverse={presentation?.inverse || undefined}
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
