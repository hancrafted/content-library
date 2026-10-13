/*
 * A server part of this Slide: one plain prompt and its flat answer, no chat
 * chrome. It takes plain props, never the kit; the Slide reads its strings
 * with `t` and passes them in, plus the `data-target` a Speaker note names.
 */
export function PromptExchange({
  promptLabel,
  prompt,
  answerLabel,
  answer,
  ...props
}: {
  promptLabel: string;
  prompt: string;
  answerLabel: string;
  answer: string;
  'data-target'?: string;
}) {
  return (
    <div {...props} className="w-full max-w-md rounded-lg border border-border bg-card p-6">
      <div className="flex gap-4">
        <span className="w-8 shrink-0 text-caption font-medium text-human">{promptLabel}</span>
        <p className="font-mono text-body text-foreground">{prompt}</p>
      </div>
      <div className="mt-4 flex gap-4 border-t border-border pt-4">
        <span className="w-8 shrink-0 text-caption font-medium text-ai">{answerLabel}</span>
        <p className="text-body text-muted-foreground">{answer}</p>
      </div>
    </div>
  );
}
