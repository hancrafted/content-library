export interface Handoff {
  readonly stage: string;
  readonly text: string;
}

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

export function HandoffAside({ text }: { readonly text: string }) {
  return (
    <span className="text-caption font-normal text-foreground @2xl:hidden">
      <span aria-hidden="true">→ </span>
      {text}
    </span>
  );
}
