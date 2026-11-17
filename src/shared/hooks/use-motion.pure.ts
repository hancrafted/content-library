/*
 * The counting behind `useMotion`, free of the DOM. An element is `running` from the moment it is armed (the state that
 * triggers its motion changed) until every transition and keyframe animation it started has ended or been cancelled.
 * If nothing started within `IDLE_FRAMES` animation frames (reduced motion, no property changed), it settles anyway,
 * so a browser test never waits on a motion that will not come.
 */

export const IDLE_FRAMES = 2;

export interface MotionState {
  readonly phase: 'running' | 'settled';
  readonly live: number;
  /** Animation frames since the last arm with nothing live. */
  readonly idle: number;
}

export const MOTION_AT_REST: MotionState = { phase: 'settled', live: 0, idle: 0 };

export const arm = (state: MotionState): MotionState => ({ ...state, phase: 'running', idle: 0 });

export const start = (state: MotionState): MotionState => ({ phase: 'running', live: state.live + 1, idle: 0 });

export const settle = (state: MotionState): MotionState => {
  const live = Math.max(0, state.live - 1);
  return live === 0 && state.live > 0 ? { phase: 'settled', live, idle: 0 } : { ...state, live };
};

export const frame = (state: MotionState): MotionState => {
  if (state.phase === 'settled' || state.live > 0) return state;
  const idle = state.idle + 1;
  return idle >= IDLE_FRAMES ? { phase: 'settled', live: 0, idle: 0 } : { ...state, idle };
};
