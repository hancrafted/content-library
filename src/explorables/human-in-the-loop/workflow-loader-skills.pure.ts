import { markerNamesIn, unknownMarkers } from './workflow-markers.pure.ts';
import type { SectionDef, StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The checks of technical prompts that call skills. A skill is named in `skills` and printed as a `/<name>` line at the
 * top of the prompt, so a slash call inside section text is refused; a second skill goes in `then`. A technical prompt
 * names `{{item}}` only in a stage that plays rounds at the Technical level. One sentence per problem.
 */

const SKILL_NAME = /^[a-z][a-z0-9-]*$/;

/** A `/name` token at the start of a line or after a space or an opening mark, ended by space, end or punctuation: not a path or URL. */
const SLASH_CALL = /(?:^|[\s("'`])\/([a-z][a-z0-9-]*)(?=$|[\s.,;:)"'`!?])/gm;

/** The skills a text calls with a slash, in order, each once. */
export const slashCallsIn = (text: string): string[] => [
  ...new Set([...text.matchAll(SLASH_CALL)].map((found) => `/${found[1] ?? ''}`)),
];

const callsIn = (sections: readonly SectionDef[]): string[] => [
  ...new Set(sections.flatMap((s) => slashCallsIn(s.text))),
];

function nameProblems(task: TaskDef): string[] {
  const names = [...(task.skills ?? []), ...(task.then?.skills ?? [])];
  return names
    .filter((name) => !SKILL_NAME.test(name))
    .map((name) => `Task "${task.id}" names the skill "${name}"; write the name without the slash, lowercase.`);
}

function callProblems(task: TaskDef): string[] {
  const text = (which: string, sections: readonly SectionDef[]) =>
    callsIn(sections).map(
      (call) => `The ${which} of task "${task.id}" calls ${call} in its text; name it in \`skills\`.`,
    );
  return [
    ...text('technical prompt', task.do.technical),
    ...text('second technical prompt', task.then?.sections ?? []),
  ];
}

function itemProblems(task: TaskDef, stage: StageDef): string[] {
  const plays = stage.foreach?.technical === 'rounds';
  const sections = [...task.do.technical, ...(task.then?.sections ?? [])];
  if (plays || !markerNamesIn(sections.map((s) => s.text)).includes('item')) return [];
  return [
    `The technical prompt of task "${task.id}" names {{item}}, but stage "${stage.id}" has no \`foreach.technical: rounds\`.`,
  ];
}

function thenMarkerProblems(task: TaskDef, stage: StageDef): string[] {
  if (task.then === undefined) return [];
  const scope = {
    reviewer: false,
    slots: task.slots,
    repeated: stage.foreach?.technical === 'rounds',
    limits: Object.keys(task.limits ?? {}),
  };
  return unknownMarkers(task.then.sections, scope).map(
    (marker) => `The second technical prompt of task "${task.id}" has the unknown marker {{${marker}}}.`,
  );
}

/** Skill names, slash calls in technical text, `{{item}}` without technical rounds, and the markers of `then`. */
export const skillProblems = (file: WorkflowFile): string[] =>
  file.stages.flatMap((stage) =>
    stage.jobs.flatMap((task) => [
      ...nameProblems(task),
      ...callProblems(task),
      ...itemProblems(task, stage),
      ...thenMarkerProblems(task, stage),
    ]),
  );
