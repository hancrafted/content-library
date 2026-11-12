/*
 * The first spawn (design-ADR 0024 §3, §5): of a work center's spawns, in the file or resolved to belts, the first
 * carries the request on, and a center's `escalate` rides on it. The file's checks and the model both ask here, so
 * "first" means one thing; it sits outside the model so the checks can reach it.
 */

/** The first of a work center's spawns, or none for a center without any. */
export const firstSpawn = <T>(spawns: readonly T[]): T | undefined => spawns[0];
