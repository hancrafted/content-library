import type { DashboardReadout } from './dashboard-readouts.pure';
import type { Words } from './software-ecology-words.types';
import type { RoleWords } from './software-ecology.types';
import type { CustomerReadout } from './stage-readouts.pure';

export type Box = readonly [number, number, number, number];

export interface StillDoc {
  readonly x: number;
  readonly y: number;
  readonly good: boolean;
  readonly ai: boolean;
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
  readonly weeks: number;
  readonly level: number;
  readonly rack: readonly StillDoc[];
  readonly rackAt: { readonly x: number; readonly w: number; readonly topY: number; readonly slot: number };
  readonly work: StillDoc | null;
  readonly aiExtra: number;
}

export interface StillBelt {
  readonly key: string;
  readonly d: string;
  readonly back: string | null;
  readonly label: string;
  readonly labelAt: { readonly x: number; readonly y: number; readonly anchor: 'start' | 'middle' | 'end' };
  readonly docs: readonly StillDoc[];
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
  readonly words: Words;
}
