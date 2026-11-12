'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { Rect } from './dash-placement.pure.ts';
import type { TourWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { placeTour, type TourPlace } from './tour-placement.pure.ts';

/*
 * The guided tour's caption box (design-ADR 0024 §10), as the reference build's `renderTour` draws it: the scenario's
 * name with its step and week, "Running to week 8…" while it runs, then the step's caption and its checks in plain
 * words, and Close, Back and Next (Finish on the last step). It sits on the stage at the step's card, below it or
 * above, and follows it on any resize; while the compare stream is shown, at the card's column (`[data-col]`).
 */

export interface TourCheckRow {
  readonly text: string;
  readonly ok: boolean;
}

export interface TourBoxProps {
  readonly words: TourWords;
  readonly name: string;
  /** "· step 2 of 3 · week 8" */
  readonly head: string;
  /** While the step runs: "Running to week 8… week 5"; null once it shows. */
  readonly running: string | null;
  readonly caption: string;
  readonly checks: readonly TourCheckRow[];
  readonly card?: string;
  readonly floor: RefObject<HTMLDivElement | null>;
  readonly wrap: RefObject<HTMLElement | null>;
  /** Changes when the compare stream opens, closes or changes its columns, so the box finds its card again. */
  readonly stream?: string;
  readonly canBack: boolean;
  readonly last: boolean;
  readonly onClose: () => void;
  readonly onBack: () => void;
  readonly onNext: () => void;
}

const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

/** The card's column in the compare stream, else its card on the floor; none while it is not shown. */
const cardOf = (id: string, x: { wrap: HTMLElement; floor: HTMLElement | null }): Rect | null => {
  const el = x.wrap.querySelector(`[data-col="${id}"]`) ?? x.floor?.querySelector(`[data-id="${id}"]`);
  const r = el ? rectOf(el) : null;
  return r && r.width && r.height ? r : null;
};

function usePlace(p: TourBoxProps, box: RefObject<HTMLDivElement | null>) {
  const [place, setPlace] = useState<TourPlace | null>(null);
  useLayoutEffect(() => {
    const el = box.current,
      wrap = p.wrap.current;
    if (!el || !wrap) return;
    const again = () => {
      const card = p.card ? cardOf(p.card, { wrap, floor: p.floor.current }) : null;
      setPlace(placeTour({ card, wrap: rectOf(wrap), box: { height: el.offsetHeight } }));
    };
    again();
    const ro = new ResizeObserver(again);
    ro.observe(el);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [p.card, p.floor, p.wrap, p.stream, box]);
  return place;
}

const boxOf = (p: TourPlace | null): CSSProperties =>
  p
    ? ({ left: p.left, top: p.top, width: p.width, '--tail': `${p.tail}px` } as CSSProperties)
    : { left: 12, top: 12, visibility: 'hidden' };

function Body(p: TourBoxProps) {
  if (p.running !== null) return <p className="m-0">{p.running}</p>;
  return (
    <>
      <p className="m-0 text-body">{p.caption}</p>
      {p.checks.length ? (
        <ul className={`${styles.tourChecks} text-caption`} aria-label={p.words.checksLabel}>
          {p.checks.map((c) => (
            <li key={c.text} data-ok={c.ok}>
              <span aria-hidden="true">{c.ok ? '✓' : '✗'}</span>
              <span className="sr-only">{c.ok ? p.words.holds : p.words.fails}</span> {c.text}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

/** Close; Back and Next (Finish on the last step) once the step shows. */
function Buttons(p: TourBoxProps) {
  const shown = p.running === null;
  return (
    <div className={styles.tourBtns}>
      <button type="button" className={`${styles.ghostBtn} text-caption`} onClick={p.onClose}>
        {p.words.close}
      </button>
      <span />
      <button
        type="button"
        className={`${styles.ghostBtn} text-caption`}
        disabled={!p.canBack || !shown}
        onClick={p.onBack}
      >
        {p.words.back}
      </button>
      <button
        type="button"
        className={`${styles.tbtn} ${styles.tbtnSolid} text-caption`}
        disabled={!shown}
        onClick={p.onNext}
      >
        {p.last ? p.words.finish : p.words.next}
      </button>
    </div>
  );
}

export function TourBox(p: TourBoxProps) {
  const box = useRef<HTMLDivElement>(null);
  const place = usePlace(p, box);
  return (
    <div
      ref={box}
      className={`${styles.tourbox} text-caption`}
      role="dialog"
      aria-label={p.words.label}
      data-side={place?.side}
      style={boxOf(place)}
    >
      <p className="m-0">
        <b className="font-semibold">{p.name}</b> <span className="text-muted-foreground">{p.head}</span>
      </p>
      <Body {...p} />
      <Buttons {...p} />
    </div>
  );
}
