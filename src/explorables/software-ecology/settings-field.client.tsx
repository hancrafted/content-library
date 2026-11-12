'use client';

import { CircleHelp } from 'lucide-react';
import { createContext, useContext, useId, type ReactNode } from 'react';
import styles from './software-ecology.module.css';
import { ToolTip } from './toolbar-tip.client';

/*
 * The one form-field pattern of the Settings popover (feedback 09): a label with its (?) help icon on one line, and the
 * control full width beneath it. A choice is a full-width segmented control, a number a slider with its value on the
 * label line, an on/off setting a switch on the label line. Every control is named by its label, reachable by keyboard
 * and shows a focus ring; the help is the site's tooltip, which opens on hover and on keyboard focus.
 */

/** The help button's accessible name, with `{name}` the label it explains. */
const HelpName = createContext('{name}');
export const HelpNameProvider = HelpName.Provider;

const helpName = (template: string, name: string) => template.replace('{name}', name);

const ICON = 16;

/** The (?) icon: a button, so the keyboard reaches it and its tooltip opens on focus. */
export function HelpTip(p: { readonly name: string; readonly tip: string }) {
  const template = useContext(HelpName);
  return (
    <ToolTip tip={p.tip}>
      <button type="button" className={styles.helpBtn} aria-label={helpName(template, p.name)}>
        <CircleHelp size={ICON} aria-hidden="true" />
      </button>
    </ToolTip>
  );
}

/** What sits at the end of a label line; a function gets the label's id, to name the slider its value reads. */
type Trailing = ReactNode | ((labelId: string) => ReactNode);
const trailingOf = (t: Trailing, labelId: string): ReactNode => (typeof t === 'function' ? t(labelId) : t);

/** The id of the control a label names: the slider its value `<output>` reads. */
const controlIdOf = (labelId: string) => `${labelId}-control`;

/** A slider's value on the label line, an `<output>` that reads the slider. */
export function Value(p: { readonly labelId: string; readonly children: ReactNode }) {
  return (
    <output htmlFor={controlIdOf(p.labelId)} className="text-caption font-semibold">
      {p.children}
    </output>
  );
}

export interface FieldProps {
  readonly label: string;
  readonly tip: string;
  /** What sits at the end of the label line: a value, a switch. */
  readonly trailing?: Trailing;
  /** The control; it names itself by the label's id. */
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
        <HelpTip name={p.label} tip={p.tip} />
        {p.trailing ? <span className={styles.fieldEnd}>{trailingOf(p.trailing, id)}</span> : null}
      </div>
      {p.children?.(id)}
    </div>
  );
}

/** An on/off switch named by the label beside it. */
export function SwitchControl(p: {
  readonly on: boolean;
  readonly labelId: string;
  readonly onFlip: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      className={styles.fswitch}
      aria-checked={p.on}
      aria-labelledby={p.labelId}
      onClick={() => p.onFlip(!p.on)}
    >
      <span className={styles.fswitchTrack} aria-hidden="true" />
    </button>
  );
}

/** A switch as a whole field: its label, help and the switch on one line. */
export function SwitchField(p: {
  readonly label: string;
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
        <HelpTip name={p.label} tip={p.tip} />
        <span className={styles.fieldEnd}>
          {p.value ? trailingOf(p.value, id) : null}
          <SwitchControl on={p.on} labelId={id} onFlip={p.onFlip} />
        </span>
      </div>
      {p.children?.(id)}
    </div>
  );
}

export interface SegmentedProps<T extends string> {
  readonly labelId: string;
  readonly items: readonly { readonly id: T; readonly label: string; readonly tip?: string }[];
  readonly on: string;
  readonly onPick: (id: T) => void;
  /** The AI choices are drawn in the AI colour. */
  readonly ai?: boolean;
}

/** A choice as one full-width segmented control. */
export function Segmented<T extends string>(p: SegmentedProps<T>) {
  return (
    <div className={styles.segFull} role="group" aria-labelledby={p.labelId} data-tone={p.ai ? 'ai' : undefined}>
      {p.items.map((x) => (
        <ToolTip key={x.id} tip={x.tip ?? ''}>
          <button type="button" className="text-caption" aria-pressed={x.id === p.on} onClick={() => p.onPick(x.id)}>
            {x.label}
          </button>
        </ToolTip>
      ))}
    </div>
  );
}

/** A slider full width, named by the label; its value shows on the label line. */
export function SliderControl(p: {
  readonly labelId: string;
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
