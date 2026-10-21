import { useRef, type ChangeEvent, type PointerEvent } from 'react';
import { fill, stepCat, stepSize, storyOf, type View } from './context-view';
import styles from './context-window.module.css';
import { colourOf } from './context-window.pure';
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
function usePointer(v: View) {
  const track = useRef<HTMLDivElement>(null);
  const steps = v.chat.steps.length;
  const at = (event: PointerEvent) => (track.current ? stepAt(track.current, event, steps) : v.state.step);
  const onPointerMove = (event: PointerEvent<HTMLInputElement>) => {
    const step = at(event);
    const hovering = event.pointerType === 'mouse' && hoverCapable() && !event.buttons;
    if (hovering && step !== v.state.previewStep) v.dispatch({ type: 'PREVIEW', step });
    else if (event.buttons && step !== v.state.step) v.dispatch({ type: 'COMMIT', step });
  };
  const onPointerLeave = (event: PointerEvent<HTMLInputElement>) => {
    if (event.pointerType === 'mouse' && v.state.previewStep !== null) v.dispatch({ type: 'PREVIEW_END' });
  };
  const onPointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (v.preset.timelineLocked) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    v.dispatch({ type: 'COMMIT', step: at(event) });
  };
  return { track, handlers: { onPointerMove, onPointerLeave, onPointerDown } };
}

function Preview({ v, f }: { readonly v: View; readonly f: (step: number) => number }) {
  const preview = v.state.previewStep;
  const step = preview === null ? undefined : v.chat.steps[preview - 1];
  if (preview === null || preview === v.state.step || !step) return null;
  return (
    <>
      <span className={styles.ghost} aria-hidden="true" style={vars({ '--f': f(preview) })}>
        {preview}
      </span>
      <span className={`${styles.tip} font-medium`} aria-hidden="true" style={vars({ '--f': f(preview) })}>
        {storyOf(v, step).event}
        <small className="text-caption">{stepSize(v, step)}</small>
      </span>
    </>
  );
}

function Marks({ v, f }: { readonly v: View; readonly f: (step: number) => number }) {
  return v.chat.steps.map((step, i) => (
    <span
      key={step.id}
      className={styles.mark}
      aria-hidden="true"
      data-big={v.notes[step.id]?.big ? '' : undefined}
      data-future={i >= v.state.step ? '' : undefined}
      style={tint(colourOf(stepCat(step), v.state.depth), { '--f': f(i + 1) })}
    />
  ));
}

/** The range input under the track: the keyboard's and the screen reader's way along the timeline. */
const rangeAttrs = (v: View, valueText: string) => ({
  type: 'range',
  className: styles.range,
  min: 1,
  max: v.chat.steps.length,
  step: 1,
  value: v.state.step,
  disabled: v.preset.timelineLocked,
  'aria-label': v.words.timeline,
  'aria-valuetext': valueText,
  onChange: (event: ChangeEvent<HTMLInputElement>) => v.dispatch({ type: 'COMMIT', step: Number(event.target.value) }),
});

export function Timeline({ v, valueText }: { readonly v: View; readonly valueText: string }) {
  const { track, handlers } = usePointer(v);
  const n = v.chat.steps.length;
  const f = (step: number) => (n > 1 ? (step - 1) / (n - 1) : 0);
  return (
    <div className={styles.tl}>
      <div className={styles.head} aria-hidden="true" />
      <div ref={track} className={styles.track}>
        <span className={styles.railLine} aria-hidden="true" />
        <span className={styles.fill} aria-hidden="true" style={vars({ '--f': f(v.state.step) })} />
        <Marks v={v} f={f} />
        <input {...rangeAttrs(v, valueText)} {...handlers} />
        <span className={`${styles.thumb} font-semibold`} aria-hidden="true" style={vars({ '--f': f(v.state.step) })}>
          {v.state.step}
        </span>
        <Preview v={v} f={f} />
      </div>
      <div className={styles.stepLabel} aria-hidden="true">
        {fill(v.words.steps, { count: n })}
      </div>
    </div>
  );
}
