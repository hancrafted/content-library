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
  const { declaration, targetStyle, targetSurface } = edge;
  const destination = destinationStyle(targetStyle);
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
        <InkFilterDefinition style={declaration.effect} />
        <div
          className={styles.target}
          style={{ ...destination, '--slide-transition-target-surface': targetSurface } as CSSProperties}
        >
          <InkCanvas
            variant={declaration.effect}
            color="var(--slide-transition-target-surface)"
            bleed={`var(--slide-transition-bleed, ${INK_PROFILES[declaration.effect].bleed}px)`}
            controlled
          />
        </div>
      </div>
    </SlideIdentity>
  );
}

function destinationStyle(style: ResolvedSlideTransition['targetStyle']) {
  return Object.fromEntries(Object.entries(style ?? {}).filter(([key]) => !key.startsWith('--slide-transition-')));
}
