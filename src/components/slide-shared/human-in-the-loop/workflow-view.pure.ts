import { handoffBlocks, parseHandoff, type Handoff } from './handoff.pure';
import { jobsOf } from './workflow-jobs.pure';
import type { Level } from './workflow-state.pure';
import type { Job, Workflow } from './workflow.types';

/*
 * The view seam: what a stage's "Try it" modal shows for a Workflow at a level. Pure, so the modal's information
 * architecture (numbered steps first, explanation below) and Simple vs Technical are testable without a browser. It
 * holds no words of its own: every label is the Workflow's, and the parts bring the chrome words.
 */

export interface ViewOptions {
  readonly level: Level;
}

/** What a step copies and opens: a prompt, or at the Technical level the one-line `/skill` command. */
export interface PromptView {
  readonly kind: 'prompt' | 'command';
  readonly text: string;
  /** The short grill of an interview prompt; the Short toggle swaps it for `text`. */
  readonly short?: string;
}

/** One numbered step of a job: one line saying what to do, and the prompt behind it. */
export interface StepView {
  readonly id: 'run' | 'check' | 'page';
  readonly todo: string;
  readonly prompt: PromptView;
}

/** The explanation under the steps: what the job does, in and out, what good looks like, skills, the example. */
export type ModalSection =
  | { readonly kind: 'does'; readonly text: string }
  | { readonly kind: 'in' | 'out' | 'criteria'; readonly items: readonly string[] }
  | { readonly kind: 'skills'; readonly links: readonly { readonly label: string; readonly href: string }[] }
  | { readonly kind: 'example' };

/** One job inside a stage's modal. */
export interface JobModalView {
  readonly id: string;
  readonly title: string;
  /** Technical only: the one-time setup block shown with the command. */
  readonly setup?: string;
  /** The numbered steps, in order: run, check, optional page. */
  readonly steps: readonly StepView[];
  /** The explanation, below the steps. */
  readonly sections: readonly ModalSection[];
  /** The example output's parsed handoff blocks; blocks that do not parse are left out. */
  readonly examples: readonly Handoff[];
}

/** A stage's "Try it" modal: its jobs, in order. */
export interface StageView {
  readonly id: string;
  readonly name: string;
  readonly jobs: readonly JobModalView[];
}

export interface WorkflowView {
  readonly title: string;
  readonly stages: readonly StageView[];
}

const SKILLS_URL = 'https://github.com/mattpocock/skills/tree/main/skills';

/** The links that open a chat tool with the text prefilled in a new tab. */
export function chatLinks(text: string): { readonly chatgpt: string; readonly claude: string } {
  const q = encodeURIComponent(text);
  return { chatgpt: `https://chatgpt.com/?q=${q}`, claude: `https://claude.ai/new?q=${q}` };
}

function runOf(job: Job, level: Level): StepView {
  const command = level === 'technical' ? job.command : undefined;
  const prompt: PromptView =
    command === undefined
      ? { kind: 'prompt', text: job.run.prompt, short: job.run.short }
      : { kind: 'command', text: command };
  return { id: 'run', todo: job.run.todo, prompt };
}

function stepsOf(job: Job, level: Level): StepView[] {
  const { check, page } = job;
  return [
    runOf(job, level),
    ...(check ? [{ id: 'check', todo: check.todo, prompt: { kind: 'prompt', text: check.prompt } } as const] : []),
    ...(page ? [{ id: 'page', todo: page.todo, prompt: { kind: 'prompt', text: page[level] } } as const] : []),
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

function sectionsOf(job: Job, workflow: Workflow, level: Level): ModalSection[] {
  const examples = examplesOf(job);
  const producers = producersOf(job, workflow);
  const links = job.skills.map(({ group, name }) => ({ label: name, href: `${SKILLS_URL}/${group}/${name}` }));
  return [
    { kind: 'does', text: job.description },
    ...(producers.length > 0 ? [{ kind: 'in', items: producers } as const] : []),
    { kind: 'out', items: job.outputs.map((o) => `${o.id} (${o.kind})`) },
    ...(job.check ? [{ kind: 'criteria', items: job.check.criteria } as const] : []),
    ...(level === 'technical' && links.length > 0 ? [{ kind: 'skills', links } as const] : []),
    ...(examples.length > 0 ? [{ kind: 'example' } as const] : []),
  ];
}

function jobView(job: Job, workflow: Workflow, level: Level): JobModalView {
  const examples = examplesOf(job);
  return {
    id: job.id,
    title: job.title,
    setup: level === 'technical' ? workflow.setup : undefined,
    steps: stepsOf(job, level),
    sections: sectionsOf(job, workflow, level),
    examples,
  };
}

/** The view model of a Workflow for a level: one modal per stage. */
export function workflowView(workflow: Workflow, { level }: ViewOptions): WorkflowView {
  return {
    title: workflow.title,
    stages: workflow.stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      jobs: stage.jobs.map((job) => jobView(job, workflow, level)),
    })),
  };
}
