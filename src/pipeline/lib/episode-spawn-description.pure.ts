import { JOB_ID } from './episode-pipeline-definition.pure.ts';

export interface ParsedDescription {
  job: string;
  attempt: number;
  role: string;
  ticket?: number;
}

const ID = JOB_ID.source.slice(1, -1);
const DESCRIPTION = new RegExp(`^(${ID})#([1-9]\\d*)/(${ID})(?:/#([1-9]\\d*))?$`);

/** The shared spawn label grammar, usable by both the adapter and local browser readers. */
export function parseDescription(description: string): ParsedDescription | null {
  const m = DESCRIPTION.exec(description);
  if (m === null) return null;
  return { job: m[1], attempt: Number(m[2]), role: m[3], ...(m[4] === undefined ? {} : { ticket: Number(m[4]) }) };
}
