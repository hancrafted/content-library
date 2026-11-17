import { markerNamesIn, unknownMarkers } from './workflow-markers.pure.ts';
import type { SectionDef, StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The checks of technical prompts that call skills. A skill is named in `skills` and printed as a `/<name>` line at the
 * top of the prompt, so a bare slash call inside section text is refused, while one inside backticks is text for the
 * user to type; a second skill goes in `then`. A technical prompt names `{{item}}` only in a stage that plays rounds at
 * the Technical level. One sentence per problem.
 */

const NAME = '[a-z][a-z0-9-]*';
const SKILL_NAME = new RegExp(`^${NAME}$`);

const SLASH_CALL = new RegExp(`(?:^|[\\s("'])\\/(${NAME})(?=$|[\\s.,;:)"'!?])`, 'gm');

const CODE_SPAN = /`[^`\n]*`/g;

export const slashCallsIn = (text: string): string[] => [
  ...new Set([...text.replace(CODE_SPAN, ' ').matchAll(SLASH_CALL)].map((found) => `/${found[1] ?? ''}`)),
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

const playsRounds = (stage: StageDef): boolean => stage.foreach?.technical === 'rounds';

function itemProblems(task: TaskDef, stage: StageDef): string[] {
  const sections = [...task.do.technical, ...(task.then?.sections ?? [])];
  if (playsRounds(stage) || !markerNamesIn(sections.map((s) => s.text)).includes('item')) return [];
  return [
    `The technical prompt of task "${task.id}" names {{item}}, but stage "${stage.id}" has no \`foreach.technical: rounds\`.`,
  ];
}

function thenMarkerProblems(task: TaskDef): string[] {
  if (task.then === undefined) return [];
  const scope = {
    reviewer: false,
    slots: task.slots,
    repeated: true,
    limits: Object.keys(task.limits ?? {}),
  };
  return unknownMarkers(task.then.sections, scope).map(
    (marker) => `The second technical prompt of task "${task.id}" has the unknown marker {{${marker}}}.`,
  );
}

export const skillProblems = (file: WorkflowFile): string[] =>
  file.stages.flatMap((stage) =>
    stage.jobs.flatMap((task) => [
      ...nameProblems(task),
      ...callProblems(task),
      ...itemProblems(task, stage),
      ...thenMarkerProblems(task),
    ]),
  );
