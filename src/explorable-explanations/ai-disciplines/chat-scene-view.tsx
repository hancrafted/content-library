import type { ReactNode } from 'react';
import styles from './ai-disciplines.module.css';
import type { SceneWords } from './ai-disciplines.types';
import type { Frame, Message } from './scene-frames.pure';

/** The tool an agent reached for, by the word key that names it: a globe for the web, a lens for a search. */
const TOOL_ICONS: Record<string, ReactNode> = {
  tool1: (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </svg>
  ),
  tool2: (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="2" aria-hidden="true">
      <circle cx="10" cy="10" r="6" />
      <path d="M15 15l6 6" />
    </svg>
  ),
};

const LINE: Record<Message['from'], string> = {
  me: 'self-end rounded-br-sm bg-(--tone) text-background',
  ai: 'self-start rounded-bl-sm bg-muted text-foreground',
  tool: 'inline-flex items-center gap-1.5 self-center border border-dashed border-(--tone) bg-card font-semibold text-(--tone)',
};

function loopLabel(loop: Frame['loop'], words: SceneWords): string | null {
  if (loop === undefined) return null;
  return loop === 'done' ? words.loopDone : `${words.loop} ${loop}/2`;
}

/**
 * A chat window (a pure view): the person's message, the tools an agent reached for and the model's answer, each line
 * popping in as its frame shows it; on an agent, the loop counter in the corner.
 */
export function ChatSceneView({ frame, words }: { readonly frame: Frame; readonly words: SceneWords }) {
  const loop = loopLabel(frame.loop, words);
  return (
    <div className="absolute inset-3 flex flex-col justify-end gap-1.5 overflow-hidden rounded-xl border border-border bg-card px-2 pt-6 pb-2">
      <span aria-hidden="true" className="absolute top-1.5 left-2 flex gap-1">
        <span className="size-1.5 rounded-full bg-border" />
        <span className="size-1.5 rounded-full bg-border" />
        <span className="size-1.5 rounded-full bg-border" />
      </span>
      {loop && (
        <span data-loop="" className="absolute top-1 right-2 text-caption font-semibold text-(--tone) tabular-nums">
          {loop}
        </span>
      )}
      {frame.messages.map(({ from, key }) => (
        <p
          key={key}
          data-from={from}
          className={`${styles.pop} max-w-[85%] rounded-xl px-2.5 py-1 text-caption ${LINE[from]}`}
        >
          {TOOL_ICONS[key]}
          {words[key as keyof SceneWords]}
        </p>
      ))}
    </div>
  );
}
