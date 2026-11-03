import type { CSSProperties, Ref } from 'react';
import type { TransitionStyle } from './transition-filters';

interface InkCanvasProps {
  inkScaleRef?: Ref<HTMLDivElement>;
  color: string;
  variant: TransitionStyle;
  bleed: number | string;
  className?: string;
  controlled?: boolean;
  filterId?: string;
}

/** The filtered, bottom-origin ink surface. Progress consumers own only its scale. */
export function InkCanvas({
  inkScaleRef,
  color,
  variant,
  bleed,
  className,
  controlled = false,
  filterId = `ink-edge-${variant}`,
}: InkCanvasProps) {
  const inset = typeof bleed === 'number' ? -bleed : `calc(-1 * ${bleed})`;
  return (
    <div
      style={{
        position: 'absolute',
        top: inset,
        left: inset,
        right: inset,
        bottom: inset,
        filter: `url(#${filterId})`,
        willChange: 'transform',
      }}
      className={className}
    >
      <div ref={inkScaleRef} data-ink-scale={controlled || undefined} style={inkStyle(color, controlled)} />
    </div>
  );
}

function inkStyle(color: string, controlled: boolean): CSSProperties {
  return {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: color,
    transformOrigin: 'bottom',
    willChange: 'transform',
    ...(controlled && { transform: 'scaleY(0)' }),
  };
}
