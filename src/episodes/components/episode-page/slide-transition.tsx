import { InkCanvas } from '@/shared/components/animations/ink-canvas';
import { InkFilterDefinition } from '@/shared/components/animations/transition-filters';
import { INK_PROFILES } from '@/shared/lib/ink-transition.pure';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import type { ResolvedSlideTransition } from '../slide-master/slide-presentation';
import { SlideIdentity } from './slide-mount.client';
import styles from './slide-presentation.module.css';

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
        <InkFilterDefinition style={declaration.effect} id={filterId} />
        <div className={styles.target} style={destinationStyle(edge)}>
          <InkCanvas
            variant={declaration.effect}
            filterId={filterId}
            color="var(--slide-transition-target-surface)"
            bleed={`var(--slide-transition-bleed, ${INK_PROFILES[declaration.effect].bleed}px)`}
            controlled
          />
        </div>
      </div>
    </SlideIdentity>
  );
}

function destinationStyle({ targetStyle, targetSurface }: ResolvedSlideTransition): CSSProperties {
  return {
    ...Object.fromEntries(Object.entries(targetStyle ?? {}).filter(([key]) => !key.startsWith('--slide-transition-'))),
    '--slide-transition-target-surface': targetSurface,
  } as CSSProperties;
}
