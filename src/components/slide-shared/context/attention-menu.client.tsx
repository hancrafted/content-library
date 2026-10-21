'use client';

import { usePopoverPlacement } from '@/hooks/use-popover-placement';
import { popoverBox, type PopoverRules } from '@/lib/popover-placement.pure';
import { useCallback, useId, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { CURVE_KEYS, type Curve, type CurveKey } from './attention-curve.pure';
import { defOf } from './context-controls.pure';
import type { ContextWords } from './context-words.types';
import styles from './context.module.css';
import { ControlIcon } from './control-icons';

/*
 * The "⋯" button of the Attention head and its popover: four labelled sliders for the distribution, always summing
 * to 100. The popover is portaled into the Episode portal root (FE-009 §8) so no stacking context traps it. The state
 * is the parent's and transient (FE-001).
 */

const SLOT = 'attention-menu';
const RULES: PopoverRules = { maxWidth: 320, gap: 8, minRoom: 260 };

export interface AttentionMenuProps {
  readonly words: ContextWords;
  readonly curve: Curve;
  readonly onCurve: (key: CurveKey, value: number) => void;
}

interface PopoverProps extends AttentionMenuProps {
  readonly id: string;
  readonly anchor: HTMLElement;
  readonly onClose: () => void;
}

function Slider({ words, curve, onCurve, name }: AttentionMenuProps & { readonly name: CurveKey }) {
  const id = useId();
  const label = words.attentionCurve[name];
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="flex justify-between gap-3 text-caption">
        <span>{label}</span>
        <output htmlFor={id} className="font-mono font-semibold">
          {curve[name]}%
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={curve[name]}
        aria-valuetext={`${curve[name]}%`}
        data-curve={name}
        className={styles.curveSlider}
        onChange={(event) => onCurve(name, Number(event.currentTarget.value))}
      />
    </div>
  );
}

function Panel({ words, curve, onCurve }: AttentionMenuProps) {
  const total = CURVE_KEYS.reduce((sum, key) => sum + curve[key], 0);
  return (
    <>
      <p className="text-caption font-semibold">{words.attentionMenu}</p>
      {CURVE_KEYS.map((name) => (
        <Slider key={name} name={name} words={words} curve={curve} onCurve={onCurve} />
      ))}
      <p className="text-caption text-muted-foreground">
        <span className="font-mono">{total}%</span>
      </p>
    </>
  );
}

function Popover({ id, anchor, onClose, ...rest }: PopoverProps) {
  const placed = usePopoverPlacement({ anchor, side: 'below', rules: RULES, slot: SLOT, onClose });
  if (placed === null) return null;
  const { root, placement } = placed;
  return createPortal(
    <div
      id={id}
      role="dialog"
      aria-label={rest.words.attentionMenu}
      data-slot={SLOT}
      data-side={placement.side}
      style={popoverBox(placement)}
      // The hook closes on Esc; a key pressed inside the popover also hands the focus back to the button.
      onKeyDown={(event: KeyboardEvent) => event.key === 'Escape' && anchor.focus()}
      className="pointer-events-auto fixed grid gap-3 rounded-xl border border-border bg-background p-4 text-foreground shadow-lg"
    >
      <Panel {...rest} />
    </div>,
    root,
  );
}

/** The ⋯ button, and the popover while it is open. */
export function AttentionMenu(props: AttentionMenuProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = useCallback(() => setAnchor(null), []);
  const def = defOf('attentionMenu');
  if (def.type !== 'menu') return null;
  return (
    <>
      <button
        type="button"
        className={styles.icon}
        aria-label={props.words[def.label]}
        title={props.words[def.tip]}
        aria-haspopup="dialog"
        aria-expanded={anchor !== null}
        aria-controls={anchor ? id : undefined}
        data-control="attentionMenu"
        onClick={(event) => {
          const target = event.currentTarget;
          setAnchor((now) => (now ? null : target));
        }}
      >
        <ControlIcon name={def.icon} />
      </button>
      {anchor && <Popover id={id} anchor={anchor} onClose={close} {...props} />}
    </>
  );
}
