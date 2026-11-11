'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { useId, type ReactNode } from 'react';
import { Glyph } from './factory-glyph-view';
import { SPEEDS } from './factory-run.pure.ts';
import type { ToolbarWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';

export interface Choice {
  readonly id: string;
  readonly name: string;
}

export interface ToolbarProps {
  readonly words: ToolbarWords;
  readonly states: readonly Choice[];
  readonly preset: string;
  readonly onPreset: (id: string) => void;
  readonly useCases: readonly Choice[];
  readonly useCase: string;
  readonly onUseCase: (id: string) => void;
  readonly sub: string;
  readonly speed: number;
  readonly onSpeed: (n: number) => void;
  readonly onClear: () => void;
  readonly clock: string;
  readonly statesTarget?: TargetProps;
  readonly statesMarker?: ReactNode;
}

function States(p: Pick<ToolbarProps, 'words' | 'states' | 'preset' | 'onPreset' | 'statesTarget' | 'statesMarker'>) {
  return (
    <div className={`${styles.states} relative`} role="group" aria-label={p.words.states} {...p.statesTarget}>
      {p.states.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`${styles.state} text-caption font-medium`}
          aria-pressed={p.preset === s.id}
          onClick={() => p.onPreset(s.id)}
        >
          {s.name}
        </button>
      ))}
      {p.statesMarker}
    </div>
  );
}

function UseCase(p: Pick<ToolbarProps, 'words' | 'useCases' | 'useCase' | 'onUseCase'>) {
  const id = useId();
  return (
    <div className={styles.usecase}>
      <label className="text-caption text-muted-foreground" htmlFor={id}>
        {p.words.useCase}
      </label>
      <select
        id={id}
        className={`${styles.select} font-semibold`}
        value={p.useCase}
        onChange={(e) => p.onUseCase(e.target.value)}
      >
        {p.useCases.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Speed(p: Pick<ToolbarProps, 'words' | 'speed' | 'onSpeed' | 'onClear' | 'clock'>) {
  const w = p.words;
  return (
    <div className={styles.tgroup} role="group" aria-label={w.speed}>
      {SPEEDS.map((v) => (
        <button
          key={v}
          type="button"
          className={`${styles.tbtn} ${styles.speed} text-caption font-semibold`}
          aria-pressed={p.speed === v}
          aria-label={v ? fillTemplate(w.speedN, { n: v }) : w.pause}
          data-tip={v ? w.speedTips[String(v)] : w.pause}
          onClick={() => p.onSpeed(v)}
        >
          {v ? `${v}×` : <Glyph name="pause" className={styles.ico} />}
        </button>
      ))}
      <button type="button" className={`${styles.tbtn} text-caption`} data-tip={w.clearTip} onClick={p.onClear}>
        <Glyph name="clear" className={styles.ico} />
        <span className={styles.tbtnLabel}>{w.clear}</span>
      </button>
      <span className={`${styles.clock} text-caption font-semibold`} aria-live="off" data-tip={w.clockTip}>
        {p.clock}
      </span>
    </div>
  );
}

/** The toolbar's #540 part (design-ADR 0024 §16): the states, the use case, speed, Clear and the day clock. */
export function FactoryToolbar(p: ToolbarProps) {
  return (
    <div className={styles.toolbar} role="toolbar" aria-label={p.words.label}>
      <div className={styles.tbRow}>
        <States {...p} />
        <UseCase {...p} />
      </div>
      <div className={`${styles.tbRow} ${styles.tbTools}`}>
        <Speed {...p} />
      </div>
      <p className={`${styles.usecaseSub} m-0 text-caption text-muted-foreground`}>{p.sub}</p>
    </div>
  );
}
