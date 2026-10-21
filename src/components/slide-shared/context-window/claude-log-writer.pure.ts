import { framesOf } from './context-window.pure';
import type { Category, Chat, Step } from './context-window.types';

/*
 * Writes a chat as a Claude Code session log that `fromClaudeLog` reads back to the same chat, given the chat's start
 * and memory size as options. A chat must open with its starting instructions; each reminder's tokens must be its
 * text's estimate, and it must end on a reply, so a request after every message measures it.
 */

type Json = Record<string, unknown>;
type StepOf<K extends Step['kind']> = Extract<Step, { kind: K }>;

interface Pen {
  /** The context before this step, and after it. */
  readonly before: number;
  readonly after: number;
  usage(context: number, output: number): Json;
}

const tokensOf = (step: Step, cat: Category) => step.blocks.find((b) => b.cat === cat)?.tokens ?? 0;
const user = (uuid: string, content: unknown, extra: Json = {}): Json => ({
  type: 'user',
  uuid,
  ...extra,
  message: { role: 'user', content },
});
const assistant = (step: Step, content: unknown[], usage: Json): Json => ({
  type: 'assistant',
  uuid: step.id,
  requestId: `req_${step.id}`,
  message: { role: 'assistant', content, usage },
});

function toolLines(step: StepOf<'tool'>, pen: Pen): Json[] {
  const ids = step.calls.map((_, n) => `toolu_${step.id}_${n + 1}`);
  const uses = step.calls.map((call, n) => ({ type: 'tool_use', id: ids[n], name: call.name, input: call.input }));
  const results = step.calls.map((call, n) => ({ type: 'tool_result', tool_use_id: ids[n], content: call.result }));
  return [assistant(step, uses, pen.usage(pen.before, tokensOf(step, 'tool_use'))), user(`${step.id}-result`, results)];
}

function compactLines(step: StepOf<'compact'>, pen: Pen): Json[] {
  const compactMetadata = { trigger: step.trigger, preTokens: pen.before, postTokens: pen.after };
  return [
    { type: 'system', subtype: 'compact_boundary', uuid: step.id, compactMetadata },
    user(`${step.id}-summary`, step.summary, { isCompactSummary: true }),
  ];
}

const WRITERS: { readonly [K in Step['kind']]: (step: StepOf<K>, pen: Pen) => Json[] } = {
  start: () => [],
  memory: (step) => [
    { type: 'attachment', uuid: step.id, attachment: { type: 'nested_memory', path: step.path, content: '' } },
  ],
  you: (step) => [user(step.id, step.text)],
  ai: (step, pen) => [
    assistant(step, [{ type: 'text', text: step.text }], pen.usage(pen.before, tokensOf(step, 'assistant'))),
  ],
  tool: toolLines,
  compact: compactLines,
  cleared: (step, pen) => [
    {
      type: 'system',
      subtype: 'microcompact_boundary',
      uuid: step.id,
      microcompactMetadata: { trigger: 'auto', preTokens: pen.before, tokensSaved: step.cleared },
    },
  ],
};

const reminderLines = (step: Step): Json[] =>
  (step.reminders ?? []).map((reminder, n) => ({
    type: 'attachment',
    uuid: `${step.id}-reminder-${n + 1}`,
    attachment: { type: reminder.kind, content: reminder.text },
  }));

/** A request's usage: the part of its context the last request already sent counts as a cache read. */
function usageWriter() {
  let cached = 0;
  return (context: number, output: number): Json => {
    const read = Math.min(cached, context);
    cached = context;
    return {
      input_tokens: context - read,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: read,
      output_tokens: output,
    };
  };
}

/** Writes a chat as a Claude Code session log, one JSON object a line. */
export function toClaudeLog(chat: Chat): string {
  if (chat.steps[0]?.kind !== 'start') throw new Error(`chat "${chat.id}" must open with a start step`);
  const frames = framesOf(chat);
  const usage = usageWriter();
  const lines = chat.steps.flatMap((step, i) => {
    const pen: Pen = { before: frames[i - 1]?.used ?? 0, after: frames[i]?.used ?? 0, usage };
    const write = WRITERS[step.kind] as (s: Step, p: Pen) => Json[];
    return [...write(step, pen), ...reminderLines(step)];
  });
  let parent: string | null = null;
  return lines
    .map((line) => {
      const out = JSON.stringify({ parentUuid: parent, ...line });
      parent = typeof line.uuid === 'string' ? line.uuid : parent;
      return `${out}\n`;
    })
    .join('');
}
