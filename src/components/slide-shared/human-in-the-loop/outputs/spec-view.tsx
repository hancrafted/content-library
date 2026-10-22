import type { Handoff } from '../handoff.pure';
import type { OutputWords } from './output-words';

type Spec = Extract<Handoff, { kind: 'spec' }>;

function Checklist({ title, items, tone }: { title: string; items: readonly string[]; tone: 'in' | 'out' }) {
  return (
    <section className="flex flex-col gap-2">
      <h4 className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">{title}</h4>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-body text-foreground">
            <span
              aria-hidden
              className={
                tone === 'in'
                  ? 'mt-2 size-1.5 shrink-0 rounded-full bg-(--success)'
                  : 'mt-2 size-1.5 shrink-0 rounded-full border border-muted-foreground'
              }
            />
            <span className={tone === 'out' ? 'text-muted-foreground' : undefined}>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The spec page: the goal as a lead, the requirements and what is out of scope side by side, the slices numbered. */
export function SpecView({ spec, words }: { spec: Spec; words: OutputWords }) {
  return (
    <article data-output="spec" className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-md">
      <header className="flex flex-col gap-1 border-b border-border pb-4">
        <p className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">{words.goal}</p>
        <p className="text-subheading font-semibold text-card-foreground">{spec.goal}</p>
      </header>
      <div className="grid gap-5 @2xl:grid-cols-2">
        <Checklist title={words.requirements} items={spec.requirements} tone="in" />
        <Checklist title={words.outOfScope} items={spec.outOfScope} tone="out" />
      </div>
      <section className="flex flex-col gap-2">
        <h4 className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">{words.slices}</h4>
        <ol className="flex flex-col gap-2">
          {spec.slices.map((slice, at) => (
            <li key={slice} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-body text-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground">
                {at + 1}
              </span>
              {slice}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
