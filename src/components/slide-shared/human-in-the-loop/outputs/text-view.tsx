import type { Handoff } from '../handoff.pure';
import type { OutputWords } from './output-words';

/** The plain fallback: the text as it is, wrapped, with line breaks kept. */
export function TextView({ text }: { text: string }) {
  return (
    <pre
      data-output="text"
      className="rounded-xl border border-border bg-muted p-4 font-sans text-body whitespace-pre-wrap text-foreground"
    >
      {text}
    </pre>
  );
}

/** A requirements list on its own, as a checklist card. */
export function RequirementsView({
  requirements,
  words,
}: {
  requirements: Extract<Handoff, { kind: 'requirements' }>;
  words: OutputWords;
}) {
  return (
    <section data-output="requirements" className="rounded-xl border border-border bg-card p-5 shadow-md">
      <h4 className="mb-2 text-caption font-semibold tracking-wide text-muted-foreground uppercase">
        {words.requirements}
      </h4>
      <ul className="flex flex-col gap-1.5">
        {requirements.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-body text-foreground">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-(--success)" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
