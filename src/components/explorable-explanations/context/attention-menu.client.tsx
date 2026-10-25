'use client';

import { usePopoverPlacement } from '@/hooks/use-popover-placement';
import { popoverBox, type PopoverRules } from '@/lib/popover-placement.pure';
import { useCallback, useId, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Distribution } from './attention-distribution.client';
import { defOf } from './context-controls.pure';
import type { AttentionMenuModel } from './context-parts.types';
import type { ContextWords } from './context-words.types';
import styles from './context.module.css';
import type { AttentionLayout } from './context.types';
import { ControlIcon } from './control-icons';
import { Moves } from './moves.client';

/*
 * The "⋯" button of the Attention head and its popover: four labelled sliders for the distribution, always summing
 * to 100 (a pen turns them into number inputs the check normalises to 100), and the layout of the part. The popover is portaled into the Episode portal root (FE-009 §8) so no stacking context traps it. The state
 * is the parent's and transient (FE-001).
 */

const SLOT = 'attention-menu';
const RULES: PopoverRules = { maxWidth: 320, gap: 8, minRoom: 260 };

export interface AttentionMenuProps {
  readonly words: ContextWords;
  readonly menu: AttentionMenuModel;
}

interface PopoverProps extends AttentionMenuProps {
  readonly id: string;
  readonly anchor: HTMLElement;
  readonly onClose: () => void;
}

const LAYOUT_NAMES: readonly AttentionLayout[] = ['list', 'pinned', 'compressed'];

function Layouts({ words, menu }: AttentionMenuProps) {
  return (
    <section className="grid gap-2" aria-label={words.attentionLayout}>
      <p className="text-caption font-semibold">{words.attentionLayout}</p>
      <div role="radiogroup" aria-label={words.attentionLayout} className={`${styles.layoutChoice} text-caption`}>
        {LAYOUT_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={menu.layout === name}
            data-layout-option={name}
            onClick={() => menu.onLayout(name)}
          >
            {words.attentionLayouts[name]}
          </button>
        ))}
      </div>
    </section>
  );
}

function Panel(props: AttentionMenuProps) {
  const { curve } = props.menu;
  return (
    <>
      {curve && <Distribution words={props.words} curves={curve} />}
      <Layouts {...props} />
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
      <Moves
        as="button"
        trigger={anchor !== null}
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
      </Moves>
      {anchor && <Popover id={id} anchor={anchor} onClose={close} {...props} />}
    </>
  );
}
