/** What one stage hands over to the next, under that stage. */
export interface Handoff {
  readonly stage: string;
  readonly text: string;
}

/**
 * One caption per stage under the diagram, on its four-column rhythm (columns of equal width, the diagram's gap
 * between them). It shows where the diagram lays its stages side by side; where they stack, each handoff sits beside
 * its stage's name instead (`HandoffAside`).
 */
export function HandoffRow(props: { readonly label: string; readonly handoffs: readonly Handoff[] }) {
  return (
    <ul data-handoff-row="" aria-label={props.label} className="hidden gap-6 text-caption text-foreground @2xl:flex">
      {props.handoffs.map((handoff) => (
        <li key={handoff.stage} className="min-w-0 flex-1 px-3">
          <span aria-hidden="true">→ </span>
          <span data-handoff="">{handoff.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** A stage's handoff beside its name, shown only where the diagram stacks its stages. */
export function HandoffAside({ text }: { readonly text: string }) {
  return (
    <span className="text-caption font-normal text-foreground @2xl:hidden">
      <span aria-hidden="true">→ </span>
      {text}
    </span>
  );
}
