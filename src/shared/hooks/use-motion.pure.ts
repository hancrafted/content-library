export const IDLE_FRAMES = 2;

export interface MotionState {
  readonly phase: 'running' | 'settled';
  readonly live: number;
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
