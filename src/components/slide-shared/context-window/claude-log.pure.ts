import {
  LogReader,
  blockOf,
  isHidden,
  isObject,
  list,
  obj,
  parseLines,
  resultText,
  str,
  weight,
  type Json,
  type LogOptions,
} from './claude-log-reader.pure';
import type { Chat } from './context-window.types';

export type { LogOptions } from './claude-log-reader.pure';

/*
 * Reads a chat from a Claude Code session log (`~/.claude/projects/<project>/<session>.jsonl`), lifted from the
 * prototype's cornerstone-log block; claude-log-writer.pure.ts writes one. The log records the exact context of every
 * request (input plus cache read plus cache write) and of every compaction, but not how a request splits into parts.
 * So each measured growth goes first to the reply before it (its `output_tokens`), then to reminders and memory (by
 * text length, or the configured memory size), and what is left to the messages that arrived since, by their length.
 * docs/features/context-window.md lists the subset of the log this reads.
 */

function readUserPart(reader: LogReader, line: Json, part: Json) {
  if (part.type === 'tool_result') return reader.toolResult(str(part.tool_use_id), part.content);
  const text = str(part.text);
  if (part.type !== 'text' || !text.trim()) return;
  if (line.isMeta === true || isHidden(text)) return reader.remind({ kind: 'hidden', text });
  reader.unknown(blockOf(reader.add('you', str(line.uuid), { text }), 'user'), weight(text));
}

function readUser(reader: LogReader, line: Json) {
  const message = obj(line.message);
  if (line.isCompactSummary === true) {
    const step = [...reader.steps].reverse().find((s) => s.kind === 'compact');
    if (step) step.fields.summary = resultText(message.content);
    return;
  }
  const content = typeof message.content === 'string' ? [{ type: 'text', text: message.content }] : message.content;
  for (const part of list(content)) readUserPart(reader, line, obj(part));
}

function readAssistant(reader: LogReader, line: Json) {
  const message = obj(line.message);
  const requestId = str(line.requestId);
  if (isObject(message.usage)) reader.openRequest(requestId, message.usage);
  for (const raw of list(message.content)) {
    const part = obj(raw);
    if (part.type === 'thinking') reader.thinking();
    if (part.type === 'tool_use') reader.toolUse(str(line.uuid), requestId, part);
    if (part.type !== 'text' || !str(part.text).trim()) continue;
    const step = reader.add('ai', str(line.uuid), { text: str(part.text) });
    reader.reply(blockOf(step, 'assistant'), weight(str(part.text)));
  }
}

function readAttachment(reader: LogReader, line: Json) {
  const attachment = obj(line.attachment);
  const content =
    typeof attachment.content === 'string' ? attachment.content : JSON.stringify(attachment.content ?? '');
  if (attachment.type === 'nested_memory') reader.memory(str(line.uuid), str(attachment.path), content);
  else reader.remind({ kind: str(attachment.type) || 'attachment', text: content });
}

const SYSTEM: Readonly<Record<string, (reader: LogReader, line: Json) => void>> = {
  compact_boundary: (reader, line) => reader.compact(str(line.uuid), obj(line.compactMetadata)),
  microcompact_boundary: (reader, line) => reader.cleared(str(line.uuid), obj(line.microcompactMetadata)),
};

const LINES: Readonly<Record<string, (reader: LogReader, line: Json) => void>> = {
  user: readUser,
  assistant: readAssistant,
  attachment: readAttachment,
  system: (reader, line) => SYSTEM[str(line.subtype)]?.(reader, line),
};

/** Reads a Claude Code session log into a chat. Lines it does not know, and side chains, are skipped. */
export function fromClaudeLog(log: string, options: LogOptions): Chat {
  const reader = new LogReader(options);
  for (const line of parseLines(log)) if (line.isSidechain !== true) LINES[str(line.type)]?.(reader, line);
  return { id: options.id, steps: reader.finish() };
}
