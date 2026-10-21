import { HANDOFF_KINDS } from './handoff.pure';
import { isTree, type Tree } from './workflow-words.pure';
import type { Job, JobCheck, JobPage, Move, SkillRef, Stage } from './workflow.types';

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

function checkOf(words: Tree): JobCheck | undefined {
  if (!isTree(words.check)) return undefined;
  return { criteria: strings(words.check.criteria), prompt: text(words.check.prompt) ?? '' };
}

/** The two page prompts of a job, or a problem for a `page` that lacks one of them. */
function pageOf(words: Tree, id: string, problems: string[]): JobPage | undefined {
  if (words.page === undefined) return undefined;
  const page = isTree(words.page) ? words.page : {};
  const simple = text(page.simple);
  const technical = text(page.technical);
  if (simple && technical) return { simple, technical };
  problems.push(`Job "${id}" has a page without both words.page.simple and words.page.technical.`);
  return undefined;
}

/** A job's required word, or a problem. */
function requiredIn(words: Tree, id: string, problems: string[]) {
  return (key: 'title' | 'description' | 'prompt'): string => {
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
    prompt: required('prompt'),
    command: text(words.command),
    exampleInput: text(words.exampleInput),
    exampleOutput: text(words.exampleOutput),
    check: checkOf(words),
    page: pageOf(words, id, problems),
    parked: Array.isArray(words.parked) ? strings(words.parked) : undefined,
  };
}

function moveOf(value: unknown, id: string, problems: string[]): Move | undefined {
  const move = MOVES.find((known) => known === value);
  if (value !== undefined && !move)
    problems.push(`Stage "${id}" has the move "${String(value)}", not one of ${MOVES.join(', ')}.`);
  return move;
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
    moveLabel: text(own.move),
    move: moveOf(data.move, id, problems),
    gate: gateOf(data.gate, id, problems),
    jobs,
  };
}
