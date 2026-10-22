import type { Handoff } from '../handoff.pure';
import type { OutputWords } from './output-words';

type Research = Extract<Handoff, { kind: 'research' }>;

/** A research card: the subject as the heading, the summary as a lead, the facts as a list. */
export function ResearchView({ research, words }: { research: Research; words: OutputWords }) {
  return (
    <article
      data-output="research"
      className="flex flex-col gap-3 rounded-xl border border-border border-t-4 border-t-ai bg-card p-5 shadow-md"
    >
      <h3 className="text-subheading font-semibold text-card-foreground">{research.subject}</h3>
      <p className="text-body text-muted-foreground">{research.summary}</p>
      <section aria-label={words.facts} className="border-t border-border pt-3">
        <ul className="flex flex-col gap-1.5">
          {research.facts.map((fact) => (
            <li key={fact} className="flex items-start gap-2 text-body text-foreground">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-ai" />
              {fact}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
