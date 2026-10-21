import { useRef, type ChangeEvent, type PointerEvent } from 'react';
import type { TimelineProps } from './context-parts.types';
import { fill, stepCat, stepSize, storyOf, type Say } from './context-view';
import styles from './context.module.css';
import { colourOf } from './context.pure';
import { useSay } from './use-say';
import { tint, vars } from './window-bits';

/* The timeline: one mark per step, the committed step as a thumb, a hovered one as a ghost with its event. */

const INSET = 14;
const hoverCapable = () => window.matchMedia('(hover: hover)').matches;

/** The step under the pointer, along the track whichever way it runs. */
function stepAt(track: HTMLElement, event: PointerEvent, steps: number): number {
  const r = track.getBoundingClientRect();
  const vertical = r.height > r.width;
  const ratio = vertical
    ? (event.clientY - r.top - INSET) / (r.height - 2 * INSET)
    : (event.clientX - r.left - INSET) / (r.width - 2 * INSET);
  return Math.round(Math.max(0, Math.min(1, ratio)) * (steps - 1)) + 1;
}

/** Hover previews (a mouse only); pressing commits where the pointer is; dragging keeps committing. */
function usePointer(p: TimelineProps) {
  const track = useRef<HTMLDivElement>(null);
  const steps = p.chat.steps.length;
  const at = (event: PointerEvent) => (track.current ? stepAt(track.current, event, steps) : p.step);
  const onPointerMove = (event: PointerEvent<HTMLInputElement>) => {
    const step = at(event);
    const hovering = event.pointerType === 'mouse' && hoverCapable() && !event.buttons;
    if (hovering && step !== p.previewStep) p.onPreview(step);
    else if (event.buttons && step !== p.step) p.onCommit(step);
  };
  const onPointerLeave = (event: PointerEvent<HTMLInputElement>) => {
    if (event.pointerType === 'mouse' && p.previewStep !== null) p.onPreviewEnd();
  };
  const onPointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (p.locked) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    p.onCommit(at(event));
  };
  return { track, handlers: { onPointerMove, onPointerLeave, onPointerDown } };
}

interface PartProps {
  readonly p: TimelineProps;
  readonly say: Say;
  readonly f: (step: number) => number;
}

function Preview({ p, say, f }: PartProps) {
  const preview = p.previewStep;
  const step = preview === null ? undefined : p.chat.steps[preview - 1];
  if (preview === null || preview === p.step || !step) return null;
  return (
    <>
      <span className={styles.ghost} aria-hidden="true" style={vars({ '--f': f(preview) })}>
        {preview}
      </span>
      <span className={`${styles.tip} font-medium`} aria-hidden="true" style={vars({ '--f': f(preview) })}>
        {storyOf(say, step).event}
        <small className="text-caption">{stepSize(say, step)}</small>
      </span>
    </>
  );
}

function Marks({ p, say, f }: PartProps) {
  const depth = say.tech ? 'technical' : 'simple';
  return p.chat.steps.map((step, i) => (
    <span
      key={step.id}
      className={styles.mark}
      aria-hidden="true"
      data-big={p.notes[step.id]?.big ? '' : undefined}
      data-future={i >= p.step ? '' : undefined}
      style={tint(colourOf(stepCat(step), depth), { '--f': f(i + 1) })}
    />
  ));
}

/** The range input under the track: the keyboard's and the screen reader's way along the timeline. */
const rangeAttrs = (p: TimelineProps, say: Say) => ({
  type: 'range',
  className: styles.range,
  min: 1,
  max: p.chat.steps.length,
  step: 1,
  value: p.step,
  disabled: p.locked,
  'aria-label': say.words.timeline,
  'aria-valuetext': p.valueText,
  onChange: (event: ChangeEvent<HTMLInputElement>) => p.onCommit(Number(event.target.value)),
});

export function Timeline(p: TimelineProps) {
  const say = useSay(p);
  const { track, handlers } = usePointer(p);
  const n = p.chat.steps.length;
  const f = (step: number) => (n > 1 ? (step - 1) / (n - 1) : 0);
  return (
    <div className={styles.tl}>
      <div className={styles.head} aria-hidden="true" />
      <div ref={track} className={styles.track}>
        <span className={styles.railLine} aria-hidden="true" />
        <span className={styles.fill} aria-hidden="true" style={vars({ '--f': f(p.step) })} />
        <Marks p={p} say={say} f={f} />
        <input {...rangeAttrs(p, say)} {...handlers} />
        <span className={`${styles.thumb} font-semibold`} aria-hidden="true" style={vars({ '--f': f(p.step) })}>
          {p.step}
        </span>
        <Preview p={p} say={say} f={f} />
      </div>
      <div className={styles.stepLabel} aria-hidden="true">
        {fill(say.words.steps, { count: n })}
      </div>
    </div>
  );
}
