/*
 * The one place a Workflow's jobs are listed and looked up, so no part walks `stages` by hand. Generic over what the
 * groups hold: the Workflow's stages with their jobs, or the view's stages with their cards.
 */

interface Grouped<T> {
  readonly jobs: readonly T[];
}

/** Every job of the stages, in drawing order. */
export const jobsOf = <T>(stages: readonly Grouped<T>[]): T[] => stages.flatMap((stage) => stage.jobs);

/** The job (or card) with this id, or undefined for no id or an unknown one. */
export const jobById = <T extends { readonly id: string }>(
  stages: readonly Grouped<T>[],
  jobId: string | null | undefined,
): T | undefined => (jobId == null ? undefined : jobsOf(stages).find((job) => job.id === jobId));
