'use client';

import { usePopoverPlacement } from '@/shared/hooks/use-popover-placement';
import { popoverBox, type PopoverRules } from '@/shared/lib/popover-placement.pure';
import { useCallback, useId, useState } from 'react';
import { createPortal } from 'react-dom';

const SLOT = 'zone-label-popover';

const RULES: PopoverRules = { maxWidth: 256, gap: 8, minRoom: 96 };

export interface ZoneLabelWords {
  /** The plain zone name, always visible: `Twilight`. */
  readonly name: string;
  /** Its depth in metres: `200–1,000 m`. */
  readonly metres: string;
  /** Its scientific name: `mesopelagic`. */
  readonly science: string;
}

/** Why the popover is open: a press keeps it until the next press or Esc; hover and focus only while they last. */
type OpenBy = 'press' | 'hover' | 'focus';

function ZonePopover({
  id,
  anchor,
  words,
  onClose,
}: {
  readonly id: string;
  readonly anchor: HTMLElement;
  readonly words: ZoneLabelWords;
  readonly onClose: () => void;
}) {
  const placed = usePopoverPlacement({ anchor, side: 'below', rules: RULES, slot: SLOT, onClose });
  if (placed === null) return null;
  return createPortal(
    <div
      id={id}
      role="tooltip"
      data-slot={SLOT}
      style={popoverBox(placed.placement)}
      className="pointer-events-auto fixed rounded-lg border border-border bg-background px-3 py-2 text-caption text-foreground shadow-xl"
    >
      <p className="font-semibold tabular-nums">{words.metres}</p>
      <p className="text-muted-foreground">{words.science}</p>
    </div>,
    placed.root,
  );
}

/**
 * The zone label's button and popover (design-ADR 0025, Interaction 2): the plain zone name stays visible, and the
 * depth in metres and the scientific name open on hover, focus or tap, portaled into the Episode portal root so no
 * Slide wrapper traps it under the chrome (FE-009 §8). Open state is transient, in memory.
 */
export function ZoneLabelButton({ words, className }: { readonly words: ZoneLabelWords; readonly className?: string }) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<OpenBy | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const release = (by: OpenBy) => setOpen((now) => (now === by ? null : now));
  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        data-zone-label
        aria-expanded={open !== null}
        aria-describedby={open === null ? undefined : id}
        onClick={() => setOpen((now) => (now === 'press' ? null : 'press'))}
        onPointerEnter={(event) => event.pointerType === 'mouse' && setOpen((now) => now ?? 'hover')}
        onPointerLeave={() => release('hover')}
        onFocus={() => setOpen((now) => now ?? 'focus')}
        onBlur={() => release('focus')}
        className={className}
      >
        {words.name}
      </button>
      {open !== null && anchor !== null && <ZonePopover id={id} anchor={anchor} words={words} onClose={close} />}
    </>
  );
}
