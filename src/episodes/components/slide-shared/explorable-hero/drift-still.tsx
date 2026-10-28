import { momentOf, paintBeat, paintField } from './drift-paint';
import { type Area, type Story } from './drift.pure';
import { svgPen, type Shape } from './svg-pen';

/** The still's own coordinate box: a wide strip, drawn in its compact layout (the art above the copy). */
const STILL_WIDTH = 320;
const STILL_HEIGHT = 96;
const MARGIN = 16;
/** The field's ink: stronger than the hero's 12%, since a strip has no headline to stay behind and is read at a glance. */
const STILL_INK = 0.4;
const AREA: Area = { x: MARGIN, y: 8, w: STILL_WIDTH - 2 * MARGIN, h: STILL_HEIGHT - 16, compact: true };

function shapesOf(story: Story, beat: boolean): Shape[] {
  const { pen, shapes } = svgPen();
  const moment = momentOf(0, true);
  if (beat) paintBeat(pen, { story, area: AREA, progress: moment.progress, strength: moment.strength });
  else paintField(pen, { story, area: AREA, width: STILL_WIDTH, height: STILL_HEIGHT, t: moment.t });
  return shapes;
}

function Layer({ shapes, opacity }: { shapes: readonly Shape[]; opacity: number }) {
  return (
    <g opacity={opacity} fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {shapes.map((shape, index) => (
        <path
          key={index}
          d={shape.d}
          opacity={shape.alpha}
          strokeWidth={shape.width}
          fill={shape.filled ? 'currentColor' : 'none'}
          stroke={shape.filled ? 'none' : 'currentColor'}
          style={shape.blur ? { filter: shape.blur } : undefined}
        />
      ))}
    </g>
  );
}

/**
 * Message drift as one still frame, the reduced-motion end state with its accent beat: a static SVG strip that draws
 * from the same painters as the hero's canvas, in `currentColor` for the field and the brand accent for the beat. It
 * never moves, so a grid of them costs no script and no frame loop.
 */
export function DriftStill({ story, className }: { story: Story; className?: string }) {
  return (
    <svg
      aria-hidden
      data-drift-still={story}
      viewBox={`0 0 ${STILL_WIDTH} ${STILL_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <Layer shapes={shapesOf(story, false)} opacity={STILL_INK} />
      <g className="text-brand-accent">
        <Layer shapes={shapesOf(story, true)} opacity={1} />
      </g>
    </svg>
  );
}
