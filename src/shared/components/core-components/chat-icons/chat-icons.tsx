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
