import { InkCanvas } from '@/shared/components/animations/ink-canvas';
import { InkFilterDefinition } from '@/shared/components/animations/transition-filters';
import { WaveFront } from '@/shared/components/animations/wave-front';
import { INK_PROFILES } from '@/shared/lib/ink-transition.pure';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import type { ResolvedSlideTransition } from '../slide-master/slide-presentation';
import { SlideIdentity } from './slide-mount.client';
import styles from './slide-presentation.module.css';
import { TransitionBubbles } from './transition-bubbles.client';

const TARGET_SURFACE = 'var(--slide-transition-target-surface)';

/** Stable server host, outside SlideMount and inside the outgoing Slide's identity and local layers. */
export function SlideTransition({ edge }: { edge: ResolvedSlideTransition }) {
  const { declaration } = edge;
  // Slide anchors are kebab-case; the separator makes the ordered pair unambiguous.
  const filterId = `ink-edge-${edge.outgoing}_${edge.incoming}`;
  return (
    <SlideIdentity id={edge.outgoing}>
      <div
        aria-hidden="true"
        inert
        data-transition-edge={edge.id}
        data-transition-effect={declaration.effect}
        className={cn(styles.edge, declaration.className)}
        style={declaration.style as CSSProperties}
      >
        <div className={styles.target} style={destinationStyle(edge)}>
          <EdgeEffect effect={declaration.effect} filterId={filterId} />
        </div>
      </div>
    </SlideIdentity>
  );
}

function EdgeEffect({
  effect,
  filterId,
}: {
  effect: ResolvedSlideTransition['declaration']['effect'];
  filterId: string;
}) {
  const bleed = `var(--slide-transition-bleed, ${INK_PROFILES[effect].bleed}px)`;
  if (effect === 'bubbles')
    return (
      <>
        <WaveFront color={TARGET_SURFACE} bleed={bleed} />
        <TransitionBubbles />
      </>
    );
  return (
    <>
      <InkFilterDefinition style={effect} id={filterId} />
      <InkCanvas variant={effect} filterId={filterId} color={TARGET_SURFACE} bleed={bleed} controlled />
    </>
  );
}

function destinationStyle({ targetStyle, targetSurface }: ResolvedSlideTransition): CSSProperties {
  return {
    ...Object.fromEntries(Object.entries(targetStyle ?? {}).filter(([key]) => !key.startsWith('--slide-transition-'))),
    '--slide-transition-target-surface': targetSurface,
  } as CSSProperties;
}
