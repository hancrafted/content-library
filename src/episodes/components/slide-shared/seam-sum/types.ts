import type { ReactNode } from 'react';

/** The two halves of the party's goal: everyone celebrates together, and gets home safely. */
export type Half = 'together' | 'safely';

export interface SeamSumCard {
  readonly slug: 'activities' | 'travel' | 'venue' | 'food';
  readonly label: string;
  readonly doneBy: 'person' | 'agent';
  /** The own goal; in the compact form, the line that says it was met. */
  readonly goal: string;
  /** A time stamp beside the goal, such as "2 min". */
  readonly stamp?: string;
  readonly failure: {
    readonly fact: string;
    readonly seam: { readonly card: string; readonly held: string };
    /** What went wrong; the compact form leaves it out. */
    readonly result?: string;
    readonly breaks: Half;
  };
}

/** The words the sum draws besides its cards, all from the Scene. */
export interface SeamSumWords {
  /** The list's name, for assistive technology. */
  readonly cards: string;
  /** "Own goal:" before the goal; absent in the compact form. */
  readonly ownGoal?: string;
  /** The chip under a card's failure, per half, such as "breaks “together”". */
  readonly breaks: Readonly<Record<Half, string>>;
  readonly halves: Readonly<Record<Half, string>>;
  readonly doneBy: Readonly<Record<'person' | 'agent', string>>;
  readonly done: string;
  readonly fails: string;
}

export interface SeamSumProps {
  /** The board's label row: its name and what it is; `marker` follows it, such as a Context marker. */
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

/** A hand-drawn chip in the failure colour. */
export const FAIL_CHIP = 'rounded-full border border-destructive px-2 text-caption font-medium text-destructive';
