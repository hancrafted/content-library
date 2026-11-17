import type { ReactNode } from 'react';
import { Art } from '../art/art';
import { artName } from '../art/art.pure';
import styles from './console.module.css';
import { consoleLayout, pointsAttr, type ConsoleFacet, type ConsoleScreen } from './console.pure';

export interface ConsoleProps {
  readonly width: number;
  readonly mugs?: number;
  readonly screens?: 1 | 2;
  readonly flip?: boolean;
  readonly transform?: string;
  readonly children?: ReactNode;
}

const Facet = ({ facet: { points, tone } }: { readonly facet: ConsoleFacet }) => (
  <polygon data-tone={tone} points={pointsAttr(points)} className={styles[tone]} />
);

const Screen = ({
  screen: { frame, glass, trace },
  index,
  content,
}: {
  readonly screen: ConsoleScreen;
  readonly index: number;
  readonly content?: ReactNode;
}) => (
  <g data-screen={index}>
    <Art name={artName('console/frame', frame)}>
      {frame.map((facet, part) => (
        <Facet key={`frame-${part}`} facet={facet} />
      ))}
    </Art>
    <rect data-tone="screen" {...glass} className={styles.screen} />
    {content === undefined ? (
      <Facet facet={trace} />
    ) : (
      <svg data-slot="screen" {...glass} overflow="hidden">
        {content}
      </svg>
    )}
  </g>
);

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export function Console({ width, mugs = 0, screens = 2, flip = false, transform, children }: ConsoleProps) {
  const layout = consoleLayout({ width, mugs, screens, flip });
  return (
    <g data-console data-flip={flip ? '' : undefined} transform={transform} className={styles.console}>
      <g data-layer="desk">
        <Art name={artName('console/desk', layout.desk)}>
          {layout.desk.map((facet, index) => (
            <Facet key={`desk-${index}`} facet={facet} />
          ))}
        </Art>
      </g>
      {layout.screens.map((screen, index) => (
        <Screen key={`screen-${index}`} screen={screen} index={index} content={index === 0 ? children : undefined} />
      ))}
      {layout.mugs.map((facets, index) => (
        <g key={`mug-${index}`} data-mug>
          <Art name={artName('console/mug', facets)}>
            {facets.map((facet, part) => (
              <Facet key={`mug-${index}-${part}`} facet={facet} />
            ))}
          </Art>
        </g>
      ))}
    </g>
  );
}
