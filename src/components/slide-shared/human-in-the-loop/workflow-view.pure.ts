import { handoffBlocks, parseHandoff, type Handoff } from './handoff.pure';
import { jobsOf } from './workflow-jobs.pure';
import type { Level, Mode } from './workflow-state.pure';
import type { Job, Workflow } from './workflow.types';

/*
 * The view seam: what the diagram and the job modal show for a Workflow in a mode and level. Pure, so Watch vs Try,
 * Simple vs Technical and the modal's order are testable without a browser. It holds no words of its own: every
 * label is the Workflow's, and the parts bring the chrome words.
 */

export interface ViewOptions {
  readonly mode: Mode;
  readonly level: Level;
}

/** A quick action of the modal header: a copy of `text`, or a link `href` that opens a chat tool prefilled. */
export type ModalAction =
  | { readonly id: 'copy-prompt' | 'copy-command' | 'copy-example' | 'copy-check' | 'copy-page'; readonly text: string }
  | { readonly id: 'open-chatgpt' | 'open-claude'; readonly href: string };

export type ModalSection =
  | { readonly kind: 'does'; readonly text: string }
  | { readonly kind: 'in' | 'out' | 'criteria'; readonly items: readonly string[] }
  | { readonly kind: 'skills'; readonly links: readonly { readonly label: string; readonly href: string }[] }
  | { readonly kind: 'fullPrompt'; readonly text: string }
  | { readonly kind: 'example' };

export interface ModalView {
  readonly actions: readonly ModalAction[];
  /** The body, in inverted-pyramid order. */
  readonly sections: readonly ModalSection[];
  /** The example output's parsed handoff blocks; blocks that do not parse are left out. */
  readonly examples: readonly Handoff[];
}

export interface JobCardView {
  readonly id: string;
  readonly title: string;
  readonly detail?: string;
  readonly fanOut?: number;
  readonly focal: boolean;
  readonly parked: readonly string[];
  /** Try mode only: the position in drawing order, from 1. */
  readonly step?: number;
  /** Try mode only: the first sentence of the description. */
  readonly guide?: string;
  readonly modal: ModalView;
}

export interface StageView {
  readonly id: string;
  readonly name: string;
  readonly moveLabel?: string;
  readonly move?: string;
  readonly gate?: number;
  readonly jobs: readonly JobCardView[];
}

export interface WorkflowView {
  readonly title: string;
  readonly scenario: string;
  /** Technical only. */
  readonly setup?: string;
  readonly clickable: boolean;
  readonly stages: readonly StageView[];
}

const SKILLS_URL = 'https://github.com/mattpocock/skills/tree/main/skills';

const firstSentence = (text: string): string => /^.*?[.!?](?=\s|$)/s.exec(text.trim())?.[0] ?? text.trim();

const prefill = (base: string, prompt: string): string => `${base}?q=${encodeURIComponent(prompt)}`;

function actionsOf(job: Job, level: Level): ModalAction[] {
  const page = job.page?.[level];
  const useCommand = level === 'technical' && job.command !== undefined;
  const copy: ModalAction = useCommand
    ? { id: 'copy-command', text: job.command as string }
    : { id: 'copy-prompt', text: job.prompt };
  const optional = (id: 'copy-example' | 'copy-check' | 'copy-page', text: string | undefined): ModalAction[] =>
    text === undefined ? [] : [{ id, text }];
  return [
    copy,
    { id: 'open-chatgpt', href: prefill('https://chatgpt.com/', copy.text) },
    { id: 'open-claude', href: prefill('https://claude.ai/new', copy.text) },
    ...optional('copy-example', job.exampleInput),
    ...optional('copy-check', job.check?.prompt),
    ...optional('copy-page', page),
  ];
}

interface BodyContext {
  readonly producers: readonly string[];
  readonly examples: readonly Handoff[];
}

function coreSections(job: Job, producers: readonly string[]): ModalSection[] {
  const sections: ModalSection[] = [{ kind: 'does', text: job.description }];
  if (producers.length > 0) sections.push({ kind: 'in', items: producers });
  sections.push({ kind: 'out', items: job.outputs.map((o) => `${o.id} (${o.kind})`) });
  if (job.check) sections.push({ kind: 'criteria', items: job.check.criteria });
  return sections;
}

function technicalSections(job: Job): ModalSection[] {
  const links = job.skills.map(({ group, name }) => ({ label: name, href: `${SKILLS_URL}/${group}/${name}` }));
  return [
    ...(links.length > 0 ? [{ kind: 'skills', links } as const] : []),
    ...(job.command === undefined ? [] : [{ kind: 'fullPrompt', text: job.prompt } as const]),
  ];
}

function sectionsOf(job: Job, level: Level, { producers, examples }: BodyContext): ModalSection[] {
  return [
    ...coreSections(job, producers),
    ...(level === 'technical' ? technicalSections(job) : []),
    ...(examples.length > 0 ? [{ kind: 'example' } as const] : []),
  ];
}

/** The titles of the jobs that produce the job's inputs, falling back to the output id. */
function producersOf(job: Job, workflow: Workflow): string[] {
  const jobs = jobsOf(workflow.stages);
  return job.inputs.map((input) => jobs.find((j) => j.outputs.some((o) => o.id === input))?.title ?? input);
}

function examplesOf(job: Job): Handoff[] {
  return handoffBlocks(job.exampleOutput ?? '').flatMap((block) => {
    const read = parseHandoff(block);
    return 'handoff' in read ? [read.handoff] : [];
  });
}

function cardOf(job: Job, workflow: Workflow, options: ViewOptions & { readonly step: number }): JobCardView {
  const { mode, level, step } = options;
  const examples = examplesOf(job);
  const trying = mode === 'try';
  const modal = {
    actions: actionsOf(job, level),
    sections: sectionsOf(job, level, { producers: producersOf(job, workflow), examples }),
    examples,
  };
  return {
    id: job.id,
    title: job.title,
    detail: job.detail,
    fanOut: job.fanOut,
    focal: job.id === workflow.focalJobId,
    parked: job.parked ?? [],
    step: trying ? step : undefined,
    guide: trying ? firstSentence(job.description) : undefined,
    modal,
  };
}

/** The view model of a Workflow for a mode and level. */
export function workflowView(workflow: Workflow, options: ViewOptions): WorkflowView {
  const order = jobsOf(workflow.stages).map((job) => job.id);
  const stages = workflow.stages.map((stage): StageView => ({
    ...stage,
    jobs: stage.jobs.map((job) => cardOf(job, workflow, { ...options, step: order.indexOf(job.id) + 1 })),
  }));
  return {
    title: workflow.title,
    scenario: workflow.scenario,
    setup: options.level === 'technical' ? workflow.setup : undefined,
    clickable: options.mode === 'try',
    stages,
  };
}
