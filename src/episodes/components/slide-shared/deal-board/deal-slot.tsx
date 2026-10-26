import { cn } from '@/shared/lib/utils';
import styles from './deal-board.module.css';
import type { DealSlot } from './deal-board.pure';

/** A slot's dashed outline: faint for an `open` slot, the success colour and a slight tilt for a `payment` slot. */
export function slotOutline(slot: DealSlot): string {
  return cn(
    'border-2 border-dashed',
    slot.kind === 'payment' ? cn('rotate-1', styles.paymentSlot) : 'border-foreground/20',
  );
}
