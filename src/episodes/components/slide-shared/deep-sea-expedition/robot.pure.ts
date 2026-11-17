export const ROBOT_MOTIONS = ['beam-on', 'scan', 'dive', 'surface'] as const;
export type RobotMotion = (typeof ROBOT_MOTIONS)[number];

export type RobotAim = 'ahead' | 'down';

export type RobotState = 'deck' | 'hanging' | 'in-water' | 'seabed' | 'recovered';

export type RobotTone = 'spark' | 'glint' | 'lit' | 'mid' | 'shade' | 'dark' | 'glass' | 'glassGlint' | 'lens';

export type RobotPart = 'bail' | 'float' | 'body' | 'skids' | 'thrusters' | 'dome' | 'lamp' | 'arm';

export interface RobotFacet {
  readonly part: RobotPart;
  readonly tone: RobotTone;
  readonly points: string;
}

export const ROBOT_FACETS: readonly RobotFacet[] = [
  { part: 'bail', tone: 'shade', points: '-3,0 3,0 3,5 -3,5' },
  { part: 'float', tone: 'glint', points: '-26,10 -20,5 4,5 2,10' },
  { part: 'float', tone: 'lit', points: '2,10 4,5 24,5 30,10' },
  { part: 'float', tone: 'glint', points: '-26,10 -6,10 -14,24 -26,24' },
  { part: 'float', tone: 'lit', points: '-6,10 30,10 30,24 -14,24' },
  { part: 'float', tone: 'mid', points: '-26,18 30,18 30,20 -26,20' },
  { part: 'float', tone: 'mid', points: '30,10 36,8 36,22 30,24' },
  { part: 'float', tone: 'spark', points: '-18,7 -10,7 -14,9' },
  { part: 'body', tone: 'mid', points: '-24,24 28,24 26,40 -22,40' },
  { part: 'body', tone: 'lit', points: '-24,24 2,24 -6,40 -22,40' },
  { part: 'body', tone: 'shade', points: '28,24 36,22 34,38 26,40' },
  { part: 'body', tone: 'shade', points: '-2,29 8,29 7,33 -3,33' },
  { part: 'skids', tone: 'shade', points: '-26,40 30,40 32,45 -28,45' },
  { part: 'skids', tone: 'mid', points: '-26,40 30,40 30.6,41.5 -26.6,41.5' },
  { part: 'thrusters', tone: 'dark', points: '-34,26 -24,26 -24,36 -34,36' },
  { part: 'thrusters', tone: 'shade', points: '-34,26 -24,26 -25,28 -33,28' },
  { part: 'thrusters', tone: 'dark', points: '36,24 44,25 44,34 36,35' },
  { part: 'thrusters', tone: 'shade', points: '36,24 44,25 43,27 36,26.5' },
  { part: 'dome', tone: 'glass', points: '14,28 22,27 24,34 16,36' },
  { part: 'dome', tone: 'glassGlint', points: '15,29 19,28 17,32' },
  { part: 'lamp', tone: 'dark', points: '25,26 33,25.5 33,33.5 25,34' },
  { part: 'lamp', tone: 'lens', points: '26,28 32,27 32,32 26,33' },
  { part: 'arm', tone: 'shade', points: '-10,45 -6,45 -2,56 -6,57' },
  { part: 'arm', tone: 'dark', points: '-6,55 4,54 4,58 -6,59' },
  { part: 'arm', tone: 'dark', points: '4,54 7,55.5 4,58' },
];

export const LAMP_ORIGIN = { x: 32, y: 30 } as const;

const HEAD = { x: 19, y: 2 } as const;

const AIM_RADIANS_BELOW_HORIZON: Record<RobotAim, number> = { ahead: 0.45, down: 0.95 };
const CONE = { length: 120, spread: 0.5 } as const;
const CORE = { length: 108, spread: 0.24 } as const;

export interface RobotLookInput {
  readonly motion?: RobotMotion;
  readonly lamp?: boolean;
}

export interface RobotLook {
  readonly lampLit: boolean;
  readonly beam: boolean;
  readonly beamMotion?: RobotMotion;
  readonly bodyMotion?: RobotMotion;
}

const BEAM_MOTIONS: readonly RobotMotion[] = ['beam-on', 'scan'];

export function robotLook({ motion, lamp = true }: RobotLookInput): RobotLook {
  const beamMotion = motion !== undefined && BEAM_MOTIONS.includes(motion);
  if (beamMotion && !lamp) {
    throw new Error(`The robot's ${motion} motion ends with its beam lit, so it needs the lamp on.`);
  }
  const moves = beamMotion ? { beamMotion: motion } : { bodyMotion: motion };
  return { lampLit: lamp, beam: lamp, ...(motion === undefined ? {} : moves) };
}

const round = (value: number) => Math.round(value * 10) / 10;

const fan = (down: number, length: number, spread: number) =>
  [down - spread / 2, down + spread / 2]
    .map((angle) => `${round(Math.cos(angle) * length)},${round(Math.sin(angle) * length)}`)
    .join(' ');

export function beamPoints(aim: RobotAim): { readonly cone: string; readonly core: string } {
  const down = AIM_RADIANS_BELOW_HORIZON[aim];
  return {
    cone: `0,-2 ${fan(down, CONE.length, CONE.spread)} 0,3`,
    core: `0,-1 ${fan(down, CORE.length, CORE.spread)} 0,2`,
  };
}

export function robotHead(flip: boolean): { readonly x: number; readonly y: number } {
  return { x: flip ? -HEAD.x : HEAD.x, y: HEAD.y };
}
