// spec: docs/features/explorables/context-window.md#the-log-subset
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
import type { Chat } from './context.types';

export type { LogOptions } from './claude-log-reader.pure';

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

export function fromClaudeLog(log: string, options: LogOptions): Chat {
  const reader = new LogReader(options);
  for (const line of parseLines(log)) if (line.isSidechain !== true) LINES[str(line.type)]?.(reader, line);
  return { id: options.id, steps: reader.finish() };
}
