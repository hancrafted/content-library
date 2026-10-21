import { CONTROLS, PARTS } from './context-state.pure';
import { framesOf, type Frame } from './context.pure';
import type { Chat, Preset, WindowSize } from './context.types';

/* The Preset validator: each problem is one sentence naming its Preset and what is wrong. */

function pinnedProblems(preset: Preset, chat: Chat): string[] {
  if (!preset.pinned || preset.pinned.includes(':')) return [];
  const id = preset.pinned.split('@')[0];
  return chat.steps.some((step) => step.id === id) ? [] : [`pinned part "${preset.pinned}" is not in the chat`];
}

function shapeProblems(preset: Preset, chat: Chat): string[] {
  const steps = chat.steps.length;
  return [
    ...(preset.step >= 1 && preset.step <= steps ? [] : [`step ${preset.step} is outside the timeline (1–${steps})`]),
    ...preset.controls.filter((c) => !CONTROLS.includes(c)).map((c) => `unknown control "${c}"`),
    ...Object.keys(preset.show)
      .filter((part) => !PARTS.some((p) => p === part))
      .map((part) => `unknown part "${part}"`),
    ...pinnedProblems(preset, chat),
    ...(preset.height > 0 && Number.isFinite(preset.height) ? [] : ['the height must be a positive number of rem']),
    ...(preset.windowSwitch && preset.windows.length < 2 ? ['the window switch needs two window sizes'] : []),
  ];
}

/** The fill stays out of the buffer, except on the step right before a compaction, which must enter it. */
function fillProblems(chat: Chat, frames: readonly Frame[], window: WindowSize): string[] {
  const limit = window.tokens - window.bufferTokens;
  return frames.flatMap((frame, i) => {
    if (chat.steps[i + 1]?.kind !== 'compact')
      return frame.used > limit ? [`the chat enters the buffer at step ${i + 1} without a compaction`] : [];
    const inside = frame.used > limit && frame.used <= window.tokens;
    return inside ? [] : [`the compaction at step ${i + 2} must follow a fill inside the buffer, got ${frame.used}`];
  });
}

function windowProblems(chat: Chat, frames: readonly Frame[], window: WindowSize): string[] {
  return [
    ...(window.lines.length > 2 ? ['at most two lines on a window'] : []),
    ...window.lines
      .filter((line) => line.tokens > window.tokens)
      .map((line) => `line "${line.id}" is above the window (${window.tokens})`),
    ...fillProblems(chat, frames, window),
  ];
}

/** What is wrong with a Preset against its chat. */
export function presetProblems(preset: Preset, chat: Chat | undefined): string[] {
  if (!chat) return [`${preset.id}: unknown chat "${preset.chat}"`];
  const frames = framesOf(chat);
  const problems = [
    ...shapeProblems(preset, chat),
    ...preset.windows.flatMap((window) => windowProblems(chat, frames, window)),
  ];
  return problems.map((problem) => `${preset.id}: ${problem}`);
}
