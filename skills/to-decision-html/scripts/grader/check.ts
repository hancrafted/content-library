// The one shape every grader check takes. A check is a module in ../checks/ named `<id>.ts` that exports `check`;
// the registry finds it by its file, so adding a check never edits another file.
import type { Page } from '@playwright/test';

// The page contract's closed value sets; SKILL.md's "Page contract" table is their source.
export const MODES = ['decide', 'explain'] as const;
export const FIDELITY_RUNGS = ['diagram', 'wireframe', 'mock', 'prototype'] as const;
export const DEPTHS = ['simple', 'detailed', 'both'] as const;

export type Mode = (typeof MODES)[number];

/** A decision page as the browser left it after loading offline at one viewport width. */
export interface LoadedPage {
  /** The live page, for checks that must interact (type, click, scroll, measure). */
  readonly page: Page;
  /** The rendered DOM, serialized after scripts ran. */
  readonly html: string;
  /** Every request the page tried, the page's own URL excluded; all of them were blocked. */
  readonly requests: readonly string[];
  /** `<html data-mode>`, or null when missing. */
  readonly mode: string | null;
  readonly width: number;
}

export interface Check<O = unknown> {
  /** Equals the module's file name; a broken fixture names it. */
  readonly id: string;
  /** One line: what a passing page has. */
  readonly summary: string;
  /** The page modes it applies to; any other mode reports `skip`. Omitted: every page. */
  readonly modes?: readonly Mode[];
  /** Browser phase: gather what `judge` needs. */
  observe(loaded: LoadedPage): Promise<O> | O;
  /** Pure: one readable problem per defect; empty means pass. */
  judge(observation: O): readonly string[];
}
