/*
 * A one-folder check (ARCH-003 §4.7): a check that holds inside one folder, run by the test that folder carries, so
 * `vitest --changed` runs only the checks of the folder an edit touched. The page-folder checks
 * (`src/episodes/lib/episode-checks.ts`) and the Run checks (`tests/docs/run-checks.ts`) share this shape; each owner names
 * the test its folders carry.
 */

export type GlobEntries = Readonly<Record<string, () => Promise<unknown>>>;

export interface NamedCheck {
  readonly name: string;
  readonly findings: () => Promise<readonly string[]>;
}
