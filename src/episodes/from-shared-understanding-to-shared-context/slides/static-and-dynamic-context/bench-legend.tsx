/** The legend under a bench: each everyday object beside its AI name, the name a `machine` pill. */
export function BenchLegend({ rows }: { rows: readonly { thing: string; name: string }[] }) {
  return (
    <ul>
      {rows.map(({ thing, name }) => (
        <li key={name} className="flex items-baseline justify-between gap-3 border-b border-border py-2">
          <span className="text-body">{thing}</span>
          <span className="shrink-0 rounded-full bg-machine/15 px-3 py-0.5 text-caption font-medium text-machine">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );
}
