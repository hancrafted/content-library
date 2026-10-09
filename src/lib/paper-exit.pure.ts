import { drawRoll, type Roll } from './paper-overflow.pure';
import { PAPER_PILE_ORIGIN } from './paper-pile.pure';

/** How far above the pile origin a sheet must rise before it clears the tray walls. */
export const TRAY_RIM_CLEARANCE = 150;

/** A checked sheet leaving the tray: it lifts over the rim (lower sheets lift further), then is thrown off to the right; every sheet takes its own lift, pace and tilt. */
export function paperExit(index: number, roll: Roll) {
  if (!Number.isInteger(index) || index < 0) {
    throw new RangeError('A departing sheet needs a non-negative pile index.');
  }
  return {
    lift: Math.max(0, TRAY_RIM_CLEARANCE - index * PAPER_PILE_ORIGIN.step) + 20 + drawRoll(roll) * 40,
    sideways: 20 + drawRoll(roll) * 100,
    hang: 0.25 + drawRoll(roll) * 0.25,
    throwTime: 0.75 + drawRoll(roll) * 0.25,
    drop: 20 + drawRoll(roll) * 90,
    spin: -4 + drawRoll(roll) * 18,
  };
}
