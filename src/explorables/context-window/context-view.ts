// decision: FE-006 §4
import { fillTemplate } from '@/shared/lib/template.pure';
import { shortTokens } from './context-format.pure';
import type { ContextWords } from './context-words.types';
import { simpleOf, stepTokens } from './context.pure';
import type { Category, Chat, Preset, Step, StepNotes, StepStory, ToolCall } from './context.types';

export interface ContextViewData {
  readonly preset: Preset;
  readonly chat: Chat;
  readonly story: Readonly<Record<string, StepStory>>;
  readonly notes: Readonly<Record<string, StepNotes>>;
  readonly overrides: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly words: ContextWords;
  readonly locale: string;
}

export interface Say {
  readonly words: ContextWords;
  readonly locale: string;
  readonly story: Readonly<Record<string, StepStory>>;
  readonly tech: boolean;
}

export const fill = fillTemplate;
export const k = (view: Pick<Say, 'locale'>, n: number): string => shortTokens(n, view.locale);

export const catLabel = (view: Pick<Say, 'tech' | 'words'>, cat: Category): string =>
  view.tech ? view.words.categories[cat] : view.words.simpleCategories[simpleOf(cat)];

export const stepCat = (step: Step): Category => step.blocks.at(-1)?.cat ?? 'sysprompt';

export function storyOf(view: Pick<Say, 'story'>, step: Step): StepStory {
  const story = view.story[step.id];
  if (story) return story;
  const text = 'text' in step ? step.text : step.kind;
  return { event: text.length > 44 ? `${text.slice(0, 43)}…` : text, simple: '', technical: '' };
}

export function actOf(view: Pick<Say, 'story' | 'words'>, step: Step): string {
  const story = storyOf(view, step);
  if (story.act) return story.act;
  if (step.kind !== 'tool') return story.label ?? story.event;
  const names = step.calls.map((call) => call.name);
  if (names.some((name) => name.startsWith('Web'))) return view.words.acts.web;
  return names.includes('Read') ? view.words.acts.read : view.words.acts.run;
}

const clip = (text: string, n: number) => {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > n ? `${flat.slice(0, n - 1)}…` : flat;
};

function callLine(call: ToolCall): string {
  const input = call.input;
  const entries = Object.entries(input).filter(([key]) => key !== 'description');
  if (call.name === 'Bash') return `Bash(${clip(String(input.command ?? ''), 70)})`;
  const args = entries.map(([key, value], i) => (i === 0 ? JSON.stringify(value) : `${key}: ${JSON.stringify(value)}`));
  return `${call.name}(${clip(args.join(', '), 70)})`;
}

export function cliLines(step: Extract<Step, { kind: 'tool' }>): string[] {
  const runs: { name: string; calls: ToolCall[] }[] = [];
  for (const call of step.calls) {
    const last = runs.at(-1);
    if (last?.name === call.name) last.calls.push(call);
    else runs.push({ name: call.name, calls: [call] });
  }
  return runs.flatMap((run) =>
    run.calls.length > 2 ? [`${run.name} × ${run.calls.length}`] : run.calls.map(callLine),
  );
}

export function outOf(view: Pick<Say, 'story' | 'locale'>, step: Extract<Step, { kind: 'tool' }>): string {
  const story = view.story[step.id];
  if (story?.out) return story.out;
  const tokens = step.blocks.find((b) => b.cat === 'tool_result')?.tokens ?? 0;
  return `${clip(step.calls[0]?.result ?? '', 60)} · ${shortTokens(tokens, view.locale)}`;
}

export const stepSize = (view: Pick<Say, 'locale'>, step: Step): string => `+${k(view, stepTokens(step))}`;
