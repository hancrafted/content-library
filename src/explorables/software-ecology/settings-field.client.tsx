'use client';

import { CircleHelp } from 'lucide-react';
import { createContext, useContext, useId, type ReactNode } from 'react';
import styles from './software-ecology.module.css';
import { ToolTip } from './toolbar-tip.client';

const HelpName = createContext('{name}');
export const HelpNameProvider = HelpName.Provider;

const helpName = (template: string, name: string) => template.replace('{name}', name);

const ICON = 16;

export function HelpTip(p: { readonly name: string; readonly tip: string; readonly control: string }) {
  const template = useContext(HelpName);
  return (
    <ToolTip tip={p.tip}>
      <button type="button" className={styles.helpBtn} aria-label={helpName(template, p.name)} data-control={p.control}>
        <CircleHelp size={ICON} aria-hidden="true" />
      </button>
    </ToolTip>
  );
}

type Trailing = ReactNode | ((labelId: string) => ReactNode);
const trailingOf = (t: Trailing, labelId: string): ReactNode => (typeof t === 'function' ? t(labelId) : t);

const controlIdOf = (labelId: string) => `${labelId}-control`;

export function Value(p: { readonly labelId: string; readonly children: ReactNode }) {
  return (
    <output htmlFor={controlIdOf(p.labelId)} className="text-caption font-semibold">
      {p.children}
    </output>
  );
}

export interface FieldProps {
  readonly label: string;
  readonly control: string;
  readonly tip: string;
  readonly trailing?: Trailing;
  readonly children?: (labelId: string) => ReactNode;
}

export function Field(p: FieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <span id={id} className={`${styles.fieldLabel} text-caption font-medium`}>
          {p.label}
        </span>
        <HelpTip name={p.label} tip={p.tip} control={`${p.control}.help`} />
        {p.trailing ? <span className={styles.fieldEnd}>{trailingOf(p.trailing, id)}</span> : null}
      </div>
      {p.children?.(id)}
    </div>
  );
}

export function SwitchControl(p: {
  readonly control: string;
  readonly on: boolean;
  readonly labelId: string;
  readonly onFlip: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      data-control={p.control}
      className={styles.fswitch}
      aria-checked={p.on}
      aria-labelledby={p.labelId}
      onClick={() => p.onFlip(!p.on)}
    >
      <span className={styles.fswitchTrack} aria-hidden="true" />
    </button>
  );
}

export function SwitchField(p: {
  readonly label: string;
  readonly control: string;
  readonly tip: string;
  readonly on: boolean;
  readonly onFlip: (on: boolean) => void;
  readonly value?: Trailing;
  readonly children?: (labelId: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <span id={id} className={`${styles.fieldLabel} text-caption font-medium`}>
          {p.label}
        </span>
        <HelpTip name={p.label} tip={p.tip} control={`${p.control}.help`} />
        <span className={styles.fieldEnd}>
          {p.value ? trailingOf(p.value, id) : null}
          <SwitchControl control={p.control} on={p.on} labelId={id} onFlip={p.onFlip} />
        </span>
      </div>
      {p.children?.(id)}
    </div>
  );
}

export interface SegmentedProps<T extends string> {
  readonly labelId: string;
  readonly control: string;
  readonly items: readonly {
    readonly id: T;
    readonly label: string;
    readonly tip?: string;
    readonly hook?: string;
  }[];
  readonly on: string;
  readonly onPick: (id: T) => void;
  readonly ai?: boolean;
}

export function Segmented<T extends string>(p: SegmentedProps<T>) {
  return (
    <div className={styles.segFull} role="group" aria-labelledby={p.labelId} data-tone={p.ai ? 'ai' : undefined}>
      {p.items.map((x) => (
        <ToolTip key={x.id} tip={x.tip ?? ''}>
          <button
            type="button"
            className="text-caption"
            data-control={`${p.control}.${x.hook ?? x.id}`}
            aria-pressed={x.id === p.on}
            onClick={() => p.onPick(x.id)}
          >
            {x.label}
          </button>
        </ToolTip>
      ))}
    </div>
  );
}

export function SliderControl(p: {
  readonly labelId: string;
  readonly control: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly value: number;
  readonly valueText?: string;
  readonly disabled?: boolean;
  readonly onChange: (n: number) => void;
}) {
  return (
    <input
      type="range"
      data-control={p.control}
      id={controlIdOf(p.labelId)}
      className={styles.fslider}
      aria-labelledby={p.labelId}
      min={p.min}
      max={p.max}
      step={p.step}
      value={p.value}
      aria-valuetext={p.valueText}
      disabled={p.disabled}
      onChange={(e) => p.onChange(Number(e.target.value))}
    />
  );
}
