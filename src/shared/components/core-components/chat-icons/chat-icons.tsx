import type { ChatMarkName } from './chat-marks.pure';

/*
 * Small marks for the "open in a chat tool" buttons, drawn here because no icon set ships brand marks: a six-petal
 * rosette for ChatGPT, a four-point star for Gemini. Decorative: the buttons carry the names.
 */

interface MarkProps {
  readonly className?: string;
}

function ChatGptMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      {[0, 60, 120].map((angle) => (
        <rect key={angle} x="8.2" y="2.6" width="7.6" height="18.8" rx="3.8" transform={`rotate(${angle} 12 12)`} />
      ))}
    </svg>
  );
}

function GeminiMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10 5.2-.6 9.4-4.8 10-10Z" />
    </svg>
  );
}

/** Each mark by its name. */
export const CHAT_MARKS: Record<ChatMarkName, (props: MarkProps) => React.JSX.Element> = {
  chatgpt: ChatGptMark,
  gemini: GeminiMark,
};

/*
 * Marks for the Guide toolbar's two groups, drawn here for the same reason: an Apple apple, the four Windows panes, a
 * Tux silhouette, and, where a mark is simple enough to draw honestly, an AI agent's (Claude Code's spark, Codex's
 * prompt). Single-colour on `currentColor`, decorative: the toolbar button carries the name.
 */

function AppleMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.4 12.7c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.2-.8c-1.6 0-3.1.9-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.7c1.3 0 2.2-1.2 3-2.4.9-1.3 1.3-2.7 1.3-2.7s-2.5-1-2.5-4Zm-2.4-7.1c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4Z" />
    </svg>
  );
}

function WindowsMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M3 5.4 10.5 4.4v7H3Zm8.5-1.2L21 3v8.4h-9.5ZM3 12.6h7.5v7L3 18.6Zm8.5 0H21V21l-9.5-1.3Z" />
    </svg>
  );
}

function LinuxMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2c-2.2 0-3.4 1.8-3.4 4.2 0 1.3.2 2.1-.5 3.3C7 11.4 5.5 13.7 5.5 16c0 1.4.6 2.2 1.6 2.7-.1.5-.5 1.2-1.6 1.5-1 .3-.5 1.5.8 1.6 1.7.1 3-.4 3.6-1.1.7.3 1.5.4 2.1.4s1.4-.1 2.1-.4c.6.7 1.9 1.2 3.6 1.1 1.3-.1 1.8-1.3.8-1.6-1.1-.3-1.5-1-1.6-1.5 1-.5 1.6-1.3 1.6-2.7 0-2.3-1.5-4.6-2.6-6.5-.7-1.2-.5-2-.5-3.3C15.4 3.8 14.2 2 12 2Zm-1.3 3.3a.8 1.2 0 1 1 0 2.4.8 1.2 0 0 1 0-2.4Zm2.6 0a.8 1.2 0 1 1 0 2.4.8 1.2 0 0 1 0-2.4ZM12 8.2c1 0 1.8.5 1.8 1l-1.8.8-1.8-.8c0-.5.8-1 1.8-1Zm0 3.5c1.8 0 3.2 1.9 3.2 4.1 0 1.3-1.3 2.5-3.2 2.5s-3.2-1.2-3.2-2.5c0-2.2 1.4-4.1 3.2-4.1Z" />
    </svg>
  );
}

/** The Guide toolbar's operating systems by their pick value. */
export const OS_MARKS: Record<'mac' | 'windows' | 'linux', (props: MarkProps) => React.JSX.Element> = {
  mac: AppleMark,
  windows: WindowsMark,
  linux: LinuxMark,
};

function ClaudeCodeMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
    </svg>
  );
}

function CodexMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 7 5 5-5 5M13 18h5" />
    </svg>
  );
}

/** The AI agents whose mark is simple enough to draw; the others show their name alone. */
export const AGENT_MARKS: Partial<Record<string, (props: MarkProps) => React.JSX.Element>> = {
  'claude-code': ClaudeCodeMark,
  codex: CodexMark,
};
