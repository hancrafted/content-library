import type { Level } from './workflow-state.pure';

/*
 * Debug mode (decided with Han): when on, the two copy buttons append one instruction block that has the AI end every
 * reply with a one-line footer naming where the prompt came from, so feedback pastes straight back with its context.
 * The field values stay untranslated ids (greppable); only the instruction around the footer is a word of the locale.
 */

/** What every prompt of the shown Workflow shares. */
export interface DebugBase {
  readonly workflow: { readonly id: string; readonly title: string };
  readonly level: Level;
  readonly teaching: boolean;
  readonly locale: string;
  /** The short hash of the Workflow's source pair, or `uploaded` for a Workflow the viewer uploaded. */
  readonly source: string;
}

/** Where one item of the stepper sits: the base plus its stage, its job and, in a repeated stage, its round. */
export interface DebugScope extends DebugBase {
  readonly stage: { readonly id: string; readonly name: string };
  readonly job: { readonly id: string; readonly title: string };
  readonly round?: { readonly n: number; readonly total: number };
}

export function scopeOf(base: DebugBase, at: Pick<DebugScope, 'stage' | 'job' | 'round'>): DebugScope {
  return { ...base, ...at };
}

/** Which prompt is copied: the prompt itself, or the prompt wrapped in the request to explain it. */
export interface DebugPrompt {
  readonly prompt: 'copy' | 'explain';
  readonly step: 'do' | 'review';
  /** The chat of a fan-out or of a round. */
  readonly chat?: number;
}

const LEVELS: Record<Level, string> = { simple: 'chat', technical: 'cli' };

/** A name on one line, its quotes softened, so the footer stays one greppable line. */
const named = (id: string, name: string): string => `${id} "${name.replace(/\s+/g, ' ').replace(/"/g, "'").trim()}"`;

/** The one-line footer the AI is told to end its replies with. */
export function debugFooter(scope: DebugScope, { prompt, step, chat }: DebugPrompt): string {
  const fields = [
    `workflow=${named(scope.workflow.id, scope.workflow.title)}`,
    `stage=${named(scope.stage.id, scope.stage.name)}`,
    `job=${named(scope.job.id, scope.job.title)}`,
    scope.round && `round=${scope.round.n}/${scope.round.total}`,
    `prompt=${prompt}`,
    `step=${step}`,
    chat !== undefined && `chat=${chat}`,
    `level=${LEVELS[scope.level]}`,
    `teaching=${scope.teaching ? 'on' : 'off'}`,
    `locale=${scope.locale}`,
    `source=${scope.source}`,
  ].filter((field): field is string => typeof field === 'string');
  return `[hitl-debug] ${fields.join(' · ')}`;
}

/** The copied text with the debug instruction after it; without a footer (debug off) the text itself. */
export function withDebug(text: string, instruction: string, footer: string | null): string {
  if (footer === null) return text;
  return `${text}\n\n${instruction.replace('{footer}', () => footer)}`;
}

/** Whether the toggle shows: in development, or on a page whose URL carries `?debug`. Never for a workshop viewer. */
export function debugAvailable({
  env,
  search,
}: {
  readonly env: string | undefined;
  readonly search: string;
}): boolean {
  return env === 'development' || new URLSearchParams(search).has('debug');
}
