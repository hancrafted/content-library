/* The stills' state as plain data: what `factoryStillState` reads from the Explorable's model for the stills to draw. */
import type { DashboardReadout } from '@/explorables/software-ecology/dashboard-readouts.pure';
import type { Words } from '@/explorables/software-ecology/software-ecology-words.types';
import type { RoleWords } from '@/explorables/software-ecology/software-ecology.types';
import type { CustomerReadout } from '@/explorables/software-ecology/stage-readouts.pure';

export type Box = readonly [number, number, number, number];

/** One document as the still draws it: where, and what marks it. */
export interface StillDoc {
  readonly x: number;
  readonly y: number;
  readonly good: boolean;
  readonly ai: boolean;
  /** A complaint or rework: the red warning. */
  readonly warn: boolean;
}

export interface StillStation {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly box: Box;
  readonly inspection: boolean;
  readonly ai: boolean;
  readonly waiting: number;
  /** 0 under a week of work waiting, 1 (amber) from one week, 2 (red) from two. */
  readonly level: number;
  /** The rack's slots from the bottom, at most six. */
  readonly rack: readonly StillDoc[];
  /** Where the rack sits: its centre x, its width, the top slot's centre y and a slot's height. */
  readonly rackAt: { readonly x: number; readonly w: number; readonly topY: number; readonly slot: number };
  readonly work: StillDoc | null;
  /** AI's extra tasks per task, while AI works here. */
  readonly aiExtra: number;
}

export interface StillBelt {
  readonly key: string;
  readonly d: string;
  /** The rework lane, drawn only while work is sent back on it. */
  readonly back: string | null;
  readonly label: string;
  readonly labelAt: { readonly x: number; readonly y: number; readonly anchor: 'start' | 'middle' | 'end' };
  readonly docs: readonly StillDoc[];
  /** Where the belt ends: the pile-up of a full rack sits here. */
  readonly end: readonly [number, number];
  readonly from: string;
  readonly to: string;
}

export interface FactoryStillState {
  readonly week: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly plates: readonly (readonly [number, number])[];
  readonly belts: readonly StillBelt[];
  readonly stations: readonly StillStation[];
  readonly customer: CustomerReadout & {
    readonly headroom: number;
    readonly title: string;
    readonly box: Box;
  };
  readonly dashboard: {
    readonly id: string;
    readonly title: string;
    readonly icon: string;
    readonly role: RoleWords;
    readonly r: DashboardReadout;
  };
  /** The live toolbar's row at the step: paused, at the tour's speed, on the tour's clock (feedback 08). */
  readonly toolbar: {
    readonly states: readonly string[];
    readonly scenario: string;
    readonly caption: string;
    /** The speed menu's face, the speed Play resumes at: "20×". */
    readonly speed: string;
    /** The tour's clock: "Week 20 · Day 1". */
    readonly clock: string;
    /** The use case picker's name. */
    readonly useCase: string;
  };
  /** The Explorable's own words, for the labels the stills share with it. */
  readonly words: Words;
}
