import type { ReactNode } from 'react';

export type Half = 'together' | 'safely';

export interface SeamSumCard {
  readonly slug: 'activities' | 'travel' | 'venue' | 'food';
  readonly label: string;
  readonly doneBy: 'person' | 'agent';
  readonly goal: string;
  readonly stamp?: string;
  readonly failure: {
    readonly fact: string;
    readonly seam: { readonly card: string; readonly held: string };
    readonly result?: string;
    readonly breaks: Half;
  };
}

export interface SeamSumWords {
  readonly cards: string;
  readonly ownGoal?: string;
  readonly breaks: Readonly<Record<Half, string>>;
  readonly halves: Readonly<Record<Half, string>>;
  readonly doneBy: Readonly<Record<'person' | 'agent', string>>;
  readonly done: string;
  readonly fails: string;
}

export interface SeamSumProps {
  readonly label: { readonly name: string; readonly detail: string; readonly marker?: ReactNode };
  readonly cards: readonly SeamSumCard[];
  readonly result: {
    readonly title: string;
    readonly goal: string;
    readonly broken: readonly { readonly half: Half; readonly by: string }[];
  };
  readonly words: SeamSumWords;
  readonly compact?: boolean;
}

export const FAIL_CHIP = 'rounded-full border border-destructive px-2 text-caption font-medium text-destructive';
