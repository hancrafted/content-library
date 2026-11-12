'use client';

import { fillTemplate } from '@/shared/lib/template.pure';
import { useEffect, useRef } from 'react';
import { SPEEDS } from './factory-dials.pure.ts';
import { Glyph } from './factory-glyph-view';
import { DEFAULT_SPEED } from './factory-run.pure.ts';
import type { ToolbarWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { MenuFace, ToolbarMenu } from './toolbar-menu.client';
import { ToolTip } from './toolbar-tip.client';

/*
 * The toolbar's time controls (feature guide, Interaction 1; feedback 08): Pause, a speed menu of 1×, 2×, 5×, 10× and 20×
 * (the page starts at 1×), Clear and the clock, plain text. Pause gives back the speed last picked; a tour sets 20×
 * between its steps and gives the viewer's speed back when it ends.
 */

export interface TimeControlsProps {
  readonly words: ToolbarWords;
  readonly speed: number;
  readonly onSpeed: (n: number) => void;
  readonly onClear: () => void;
  readonly clock: string;
  /** The speed menu is open; the toolbar keeps one menu open at a time. */
  readonly open: boolean;
  readonly onOpen: (open: boolean) => void;
}

/** The speed a paused run resumes at: the running one, else the last one running, the page's 1× at first. */
function useResume(speed: number) {
  const last = useRef(speed || DEFAULT_SPEED);
  useEffect(() => {
    if (speed) last.current = speed;
  }, [speed]);
  return speed || last.current;
}

function PauseButton(p: TimeControlsProps & { resume: number }) {
  const paused = !p.speed,
    name = paused ? p.words.play : p.words.pause;
  // the button names what it does next, and its tooltip says the same
  return (
    <ToolTip tip={name}>
      <button
        type="button"
        className={`${styles.tbtn} text-caption`}
        aria-label={name}
        onClick={() => p.onSpeed(paused ? p.resume : 0)}
      >
        <Glyph name={paused ? 'play' : 'pause'} className={styles.ico} />
      </button>
    </ToolTip>
  );
}

function SpeedItems(p: TimeControlsProps & { resume: number }) {
  return SPEEDS.filter(Boolean).map((v) => (
    <button
      key={v}
      type="button"
      role="menuitemradio"
      className={`${styles.scnI} text-caption`}
      aria-checked={p.resume === v}
      onClick={() => {
        p.onOpen(false);
        p.onSpeed(v);
      }}
    >
      <b className="font-semibold">{`${v}×`}</b>
      <span className="text-muted-foreground">{p.words.speedTips[String(v)]}</span>
    </button>
  ));
}

function SpeedMenu(p: TimeControlsProps & { resume: number }) {
  const w = p.words;
  return (
    <ToolbarMenu
      open={p.open}
      onOpen={p.onOpen}
      face={<MenuFace text={`${p.resume}×`} />}
      ariaLabel={fillTemplate(w.speedMenu, { n: p.resume })}
      tip={w.speedMenuTip}
      buttonClass={`${styles.tbtn} ${styles.speed} text-caption font-semibold`}
      label={w.speed}
      role="menu"
      menuClass={styles.speedMenu}
    >
      <SpeedItems {...p} />
    </ToolbarMenu>
  );
}

export function TimeControls(p: TimeControlsProps) {
  const w = p.words,
    resume = useResume(p.speed);
  return (
    <div className={styles.tgroup} role="group" aria-label={w.speed}>
      <PauseButton {...p} resume={resume} />
      <SpeedMenu {...p} resume={resume} />
      <ToolTip tip={w.clearTip}>
        <button type="button" className={`${styles.tbtn} text-caption`} aria-label={w.clear} onClick={p.onClear}>
          <Glyph name="clear" className={styles.ico} />
        </button>
      </ToolTip>
      <span className={`${styles.clock} text-caption font-semibold`}>{p.clock}</span>
    </div>
  );
}
