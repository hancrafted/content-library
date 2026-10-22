import { HANDOFF_KINDS } from './handoff.pure';
import { isTree, type Tree } from './workflow-words.pure';
import type { GateCard, Job, JobCheck, JobPage, JobRun, Move, SkillRef, Stage, StageMove } from './workflow.types';

/*
 * Reading one stage or job out of the config data and the merged words. Each reader returns what it could read and
 * pushes a one-sentence problem for what it could not, so the loader reports everything at once.
 */

const MOVES: readonly Move[] = ['B', 'R', 'I', 'E', 'F'];
const SKILL = /^[a-z0-9-]+\/[a-z0-9-]+$/;

export const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;
export const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
export const trees = (value: unknown): Tree[] => (Array.isArray(value) ? value.filter(isTree) : []);
const treeAt = (parent: Tree, key: string): Tree => {
  const child = parent[key];
  return isTree(child) ? child : {};
};

function skillsOf(job: Tree, id: string, problems: string[]): SkillRef[] {
  return strings(job.skills).flatMap((skill) => {
    const [group, name] = skill.split('/');
    if (!SKILL.test(skill) || !group || !name) {
      problems.push(`Job "${id}" names the skill "${skill}", which is not written group/name.`);
      return [];
    }
    return [{ group, name }];
  });
}

function outputsOf(job: Tree, id: string, problems: string[]): Job['outputs'] {
  return trees(job.outputs).flatMap((output) => {
    const kind = HANDOFF_KINDS.find((known) => known === output.kind);
    const outId = text(output.id);
    if (!kind || !outId) {
      problems.push(`Job "${id}" has an output without an id or with the unknown kind "${String(output.kind)}".`);
      return [];
    }
    return [{ id: outId, kind }];
  });
}

function fanOutOf(value: unknown, id: string, problems: string[]): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number' && Number.isInteger(value) && value >= 2) return value;
  problems.push(`Job "${id}" has fanOut ${String(value)}; it must be a whole number of at least 2.`);
  return undefined;
}

/** The run step: a `todo` line, the prompt, and for an interview the short variant. */
function runOf(words: Tree, id: string, problems: string[]): JobRun {
  const run = treeAt(words, 'run');
  const todo = text(run.todo);
  const prompt = text(run.prompt);
  if (!todo) problems.push(`Job "${id}" has no words.run.todo.`);
  if (!prompt) problems.push(`Job "${id}" has no words.run.prompt.`);
  return { todo: todo ?? '', prompt: prompt ?? '', short: text(run.short), shortCommand: text(run.shortCommand) };
}

function checkOf(words: Tree, id: string, problems: string[]): JobCheck | undefined {
  if (words.check === undefined) return undefined;
  const check = treeAt(words, 'check');
  const todo = text(check.todo);
  const prompt = text(check.prompt);
  if (!todo || !prompt) problems.push(`Job "${id}" has a check without both words.check.todo and words.check.prompt.`);
  return { todo: todo ?? '', criteria: strings(check.criteria), prompt: prompt ?? '' };
}

/** The page step of a job, or a problem for a `page` that lacks a todo or one of the two prompts. */
function pageOf(words: Tree, id: string, problems: string[]): JobPage | undefined {
  if (words.page === undefined) return undefined;
  const page = treeAt(words, 'page');
  const todo = text(page.todo);
  const simple = text(page.simple);
  const technical = text(page.technical);
  if (todo && simple && technical) return { todo, simple, technical };
  problems.push(`Job "${id}" has a page without all of words.page.todo, words.page.simple and words.page.technical.`);
  return undefined;
}

/** A job's required word, or a problem. */
function requiredIn(words: Tree, id: string, problems: string[]) {
  return (key: 'title' | 'description'): string => {
    const value = text(words[key]);
    if (!value) problems.push(`Job "${id}" has no words.${key}.`);
    return value ?? '';
  };
}

/** One job from its data and its words, or null when it has no id. */
function jobOf(data: Tree, words: Tree, problems: string[]): Job | null {
  const id = text(data.id);
  if (!id) {
    problems.push('A job has no id.');
    return null;
  }
  const required = requiredIn(words, id, problems);
  return {
    id,
    title: required('title'),
    detail: text(words.detail),
    description: required('description'),
    chat: data.chat === 'continue' ? 'continue' : 'new',
    dependsOn: strings(data.dependsOn),
    inputs: strings(data.inputs),
    outputs: outputsOf(data, id, problems),
    fanOut: fanOutOf(data.fanOut, id, problems),
    skills: skillsOf(data, id, problems),
    run: runOf(words, id, problems),
    command: text(words.command),
    exampleInput: text(words.exampleInput),
    exampleOutput: text(words.exampleOutput),
    check: checkOf(words, id, problems),
    page: pageOf(words, id, problems),
    parked: Array.isArray(words.parked) ? strings(words.parked) : undefined,
  };
}

/** The BRIEF letters a stage lists, each with its tooltip from `words.stages.<id>.moves.<letter>`. */
function movesOf(data: Tree, own: Tree, problems: string[]): StageMove[] {
  const id = text(data.id) ?? '';
  const listed = data.moves === undefined ? [] : Array.isArray(data.moves) ? data.moves : [data.moves];
  const tips = treeAt(own, 'moves');
  const letters = listed.flatMap((value): Move[] => {
    const move = MOVES.find((known) => known === value);
    if (!move) problems.push(`Stage "${id}" has the move "${String(value)}", not one of ${MOVES.join(', ')}.`);
    return move ? [move] : [];
  });
  const unique = MOVES.filter((letter) => letters.includes(letter));
  return unique.flatMap((letter) => {
    const why = text(tips[letter]);
    if (!why) problems.push(`Stage "${id}" has the move ${letter} but no words.stages.${id}.moves.${letter}.`);
    return why ? [{ letter, why }] : [];
  });
}

/** The gate card of a stage, from `words.stages.<id>.card`. */
function cardOf(own: Tree, id: string, problems: string[]): GateCard | undefined {
  if (own.card === undefined) return undefined;
  const card = treeAt(own, 'card');
  const label = text(card.label);
  const status = text(card.status);
  const lines = strings(card.lines);
  if (!label || !status || lines.length === 0)
    problems.push(`Stage "${id}" has a card without words.stages.${id}.card.label, .lines and .status.`);
  return { label: label ?? '', lines, status: status ?? '' };
}

function gateOf(value: unknown, id: string, problems: string[]): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  problems.push(`Stage "${id}" has gate ${String(value)}; it must be a positive whole number.`);
  return undefined;
}

/** One stage with its jobs, or null when it has no id. */
export function stageOf(data: Tree, words: Tree, problems: string[]): Stage | null {
  const id = text(data.id);
  if (!id) {
    problems.push('A stage has no id.');
    return null;
  }
  const own = treeAt(treeAt(words, 'stages'), id);
  const jobWords = treeAt(words, 'jobs');
  const jobs = trees(data.jobs).flatMap((job) => jobOf(job, treeAt(jobWords, String(job.id)), problems) ?? []);
  if (!text(own.name)) problems.push(`Stage "${id}" has no words.stages.${id}.name.`);
  return {
    id,
    name: text(own.name) ?? '',
    moves: movesOf(data, own, problems),
    card: cardOf(own, id, problems),
    gate: gateOf(data.gate, id, problems),
    jobs,
  };
}
