import { fillTemplate } from '@/lib/template.pure';
import { shortTokens } from './context-format.pure';
import type { ViewEvent, ViewState } from './context-state.pure';
import type { Attention } from './context-usage.pure';
import type { ContextWords } from './context-words.types';
import { simpleOf, stepTokens, type Frame } from './context.pure';
import type { Category, Chat, Preset, Step, StepNotes, StepStory, ToolCall, WindowSize } from './context.types';

/* What every part of the cornerstone's view reads at one render, and the words it derives from the chat. */

/** The data the server entry hands the client leaf: plain, serializable (FE-006 §4). */
export interface ContextViewData {
  readonly preset: Preset;
  readonly chat: Chat;
  readonly story: Readonly<Record<string, StepStory>>;
  readonly notes: Readonly<Record<string, StepNotes>>;
  /** Attention units per step id, keyed by the step they apply at: the Brief's split. */
  readonly overrides: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly words: ContextWords;
  readonly locale: string;
}

/**
 * What a part needs to say things: the words, the locale, the story of each step and its own renderMode as a flag.
 * Each part builds one with `useMemo`, so a memoised item that takes it as a prop does not redraw on a hover.
 */
export interface Say {
  readonly words: ContextWords;
  readonly locale: string;
  readonly story: Readonly<Record<string, StepStory>>;
  readonly tech: boolean;
}

export interface View extends ContextViewData {
  readonly state: ViewState;
  readonly dispatch: (event: ViewEvent) => void;
  readonly frames: readonly Frame[];
  /** The step on screen: the preview while scrubbing, else the committed one. */
  readonly vis: number;
  readonly frame: Frame;
  readonly window: WindowSize;
  readonly tech: boolean;
  readonly lit: string | null;
  readonly match: (id: string, cat: Category) => boolean;
  readonly ghost: string | null;
  readonly attention: readonly Attention[];
  readonly stepOf: ReadonlyMap<string, number>;
  readonly present: ReadonlySet<Category>;
  /** A per-instance prefix for ids on the page. */
  readonly uid: string;
}

export const fill = fillTemplate;
export const k = (view: Pick<Say, 'locale'>, n: number): string => shortTokens(n, view.locale);

/** A category's name at the view's depth. */
export const catLabel = (view: Pick<Say, 'tech' | 'words'>, cat: Category): string =>
  view.tech ? view.words.categories[cat] : view.words.simpleCategories[simpleOf(cat)];

/** A step's colour comes from its last block: the result, for a tool step. */
export const stepCat = (step: Step): Category => step.blocks.at(-1)?.cat ?? 'sysprompt';

/** The story of a step, with an event line even for a step of an opened log. */
export function storyOf(view: Pick<Say, 'story'>, step: Step): StepStory {
  const story = view.story[step.id];
  if (story) return story;
  const text = 'text' in step ? step.text : step.kind;
  return { event: text.length > 44 ? `${text.slice(0, 43)}…` : text, simple: '', technical: '' };
}

/** How the app shows a tool step in Simple: "Searched the web", "Read a file", "Ran a command". */
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

/** One call as the terminal prints it: `Read("offers.pdf", pages: "1-20")`, a command bare. */
function callLine(call: ToolCall): string {
  const input = call.input;
  const entries = Object.entries(input).filter(([key]) => key !== 'description');
  if (call.name === 'Bash') return `Bash(${clip(String(input.command ?? ''), 70)})`;
  const args = entries.map(([key, value], i) => (i === 0 ? JSON.stringify(value) : `${key}: ${JSON.stringify(value)}`));
  return `${call.name}(${clip(args.join(', '), 70)})`;
}

/** A tool step's terminal lines: three or more calls of one tool in a row fold into `WebFetch × 10`. */
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

/** A tool step's result line: the story's, or the first result and the size of all of them. */
export function outOf(view: Pick<Say, 'story' | 'locale'>, step: Extract<Step, { kind: 'tool' }>): string {
  const story = view.story[step.id];
  if (story?.out) return story.out;
  const tokens = step.blocks.find((b) => b.cat === 'tool_result')?.tokens ?? 0;
  return `${clip(step.calls[0]?.result ?? '', 60)} · ${shortTokens(tokens, view.locale)}`;
}

/** The tokens a step added, as the timeline's tip prints them. */
export const stepSize = (view: Pick<Say, 'locale'>, step: Step): string => `+${k(view, stepTokens(step))}`;
