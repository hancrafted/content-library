import type { ReactNode } from 'react';
import styles from './console.module.css';
import { consoleLayout, pointsAttr, type ConsoleFacet, type ConsoleScreen } from './console.pure';

export interface ConsoleProps {
  /** The desk's width in the Scene's units, at least `MIN_CONSOLE_WIDTH`; heights stay fixed. */
  readonly width: number;
  /** Coffee mugs on the desk top, left to right, at most `maxMugs(width)`. */
  readonly mugs?: number;
  /** Two screens side by side, or one wide screen for content such as a skill file. */
  readonly screens?: 1 | 2;
  /** Desk faces left, the seat on its right. */
  readonly flip?: boolean;
  /** Places the console in the Scene's `<svg>`; (0, 0) is the desk top's front-left corner. */
  readonly transform?: string;
  /**
   * Content for the first screen, drawn in the glass's own units from its top-left corner and clipped to it; its size
   * is `consoleLayout({ width, screens }).screens[0].glass`. Without it the screen shows a glowing trace.
   */
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
    {frame.map((facet, part) => (
      <Facet key={`frame-${part}`} facet={facet} />
    ))}
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

/**
 * The control-room console the pilot sits at, after the approved Spec's low-poly console: a machinery-blue desk with
 * a keyboard, panel lamps, one or two screens and optional mugs (design-ADR 0025, "Scene figures are deep modules").
 * It draws no chair and no person: a Scene seats a `Character` at `consoleLayout(…).seat`. A Slide shows its own
 * screen content, a skill file say, by passing it as children. It has no motion.
 */
export function Console({ width, mugs = 0, screens = 2, flip = false, transform, children }: ConsoleProps) {
  const layout = consoleLayout({ width, mugs, screens, flip });
  return (
    <g data-console data-flip={flip ? '' : undefined} transform={transform} className={styles.console}>
      <g data-layer="desk">
        {layout.desk.map((facet, index) => (
          <Facet key={`desk-${index}`} facet={facet} />
        ))}
      </g>
      {layout.screens.map((screen, index) => (
        <Screen key={`screen-${index}`} screen={screen} index={index} content={index === 0 ? children : undefined} />
      ))}
      {layout.mugs.map((facets, index) => (
        <g key={`mug-${index}`} data-mug>
          {facets.map((facet, part) => (
            <Facet key={`mug-${index}-${part}`} facet={facet} />
          ))}
        </g>
      ))}
    </g>
  );
}
