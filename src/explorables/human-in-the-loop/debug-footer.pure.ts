import type { StepKind } from './workflow-prompts.pure.ts';
import type { Level } from './workflow-state.pure';

/*
 * Debug mode (decided with Han): when on, the two copy buttons append one instruction block that has the AI end every
 * reply with a one-line footer naming where the prompt came from, so feedback pastes straight back with its context.
 * The field values stay untranslated ids (greppable); only the instruction around the footer is a word of the locale.
 */

export interface DebugBase {
  readonly workflow: { readonly id: string; readonly title: string };
  readonly level: Level;
  readonly demo: boolean;
  readonly locale: string;
  readonly source: string;
}

export interface DebugScope extends DebugBase {
  readonly stage: { readonly id: string; readonly name: string };
  readonly job: { readonly id: string; readonly title: string };
  readonly round?: { readonly n: number; readonly total: number };
}

export function scopeOf(base: DebugBase, at: Pick<DebugScope, 'stage' | 'job' | 'round'>): DebugScope {
  return { ...base, ...at };
}

export interface DebugPrompt {
  readonly prompt: 'copy' | 'explain';
  readonly step: StepKind;
  readonly chat?: number;
}

const stepOf = (word: string | undefined): DebugPrompt['step'] => (word === 'review' || word === 'then' ? word : 'do');

const LEVELS: Record<Level, string> = { simple: 'chat', technical: 'cli' };

export const LEVEL_OF: Readonly<Record<string, Level>> = Object.fromEntries(
  Object.entries(LEVELS).map(([level, name]) => [name, level as Level]),
);

export const SOURCE_CHARS = 8;

/** A name on one line, its quotes softened, so the footer stays one greppable line. */
const named = (id: string, name: string): string => `${id} "${name.replace(/\s+/g, ' ').replace(/"/g, "'").trim()}"`;

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
    `demo=${scope.demo ? 'on' : 'off'}`,
    `locale=${scope.locale}`,
    `source=${scope.source}`,
  ].filter((field): field is string => typeof field === 'string');
  return `[hitl-debug] ${fields.join(' · ')}`;
}

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

const MARK = '[hitl-debug] ';
const REQUIRED = ['workflow', 'stage', 'job', 'prompt', 'step', 'level', 'demo', 'locale', 'source'] as const;

export type ReadFooter =
  | { readonly scope: DebugScope; readonly prompt: DebugPrompt }
  | { readonly problems: readonly string[] };

const fromNamed = (value: string): { id: string; title: string } => {
  const at = value.indexOf(' "');
  return at < 0 ? { id: value, title: '' } : { id: value.slice(0, at), title: value.slice(at + 2, -1) };
};

function fieldsOf(reply: string): Map<string, string> | undefined {
  const at = reply.lastIndexOf(MARK);
  if (at < 0) return undefined;
  const line = (reply.slice(at + MARK.length).split('\n')[0] ?? '').replace(/[`*\s]+$/, '');
  return new Map(
    line.split(' · ').map((field): [string, string] => {
      const eq = field.indexOf('=');
      return [field.slice(0, eq), field.slice(eq + 1)];
    }),
  );
}

type Fields = ReadonlyMap<string, string>;

function scopeFrom(fields: Fields): DebugScope {
  const get = (key: string): string => fields.get(key) ?? '';
  const stage = fromNamed(get('stage'));
  const [n = 0, total = 0] = get('round').split('/').map(Number);
  return {
    workflow: fromNamed(get('workflow')),
    stage: { id: stage.id, name: stage.title },
    job: fromNamed(get('job')),
    ...(n > 0 && total > 0 ? { round: { n, total } } : {}),
    level: LEVEL_OF[get('level')] ?? 'simple',
    demo: get('demo') === 'on',
    locale: get('locale'),
    source: get('source'),
  };
}

function promptFrom(fields: Fields): DebugPrompt {
  const chat = fields.get('chat');
  return {
    prompt: fields.get('prompt') === 'explain' ? 'explain' : 'copy',
    step: stepOf(fields.get('step')),
    ...(chat === undefined ? {} : { chat: Number(chat) }),
  };
}

export function parseDebugFooter(reply: string): ReadFooter {
  const fields = fieldsOf(reply);
  if (fields === undefined) return { problems: [`The reply has no ${MARK.trim()} line.`] };
  const missing = REQUIRED.filter((key) => !fields.has(key));
  if (missing.length > 0) return { problems: missing.map((key) => `The ${MARK.trim()} line has no ${key}.`) };
  const level = fields.get('level') ?? '';
  if (!Object.hasOwn(LEVEL_OF, level))
    return { problems: [`The ${MARK.trim()} line has level=${level}; it reads chat or cli.`] };
  return { scope: scopeFrom(fields), prompt: promptFrom(fields) };
}
