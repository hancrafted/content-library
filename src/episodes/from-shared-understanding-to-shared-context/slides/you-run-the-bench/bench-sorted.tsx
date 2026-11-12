interface Sorted {
  readonly label: string;
  readonly text: string;
}

/** What you put on the bench, edged in `machine`, and what you held back, in `warning`. */
export function BenchSorted({ onBench, heldBack }: { onBench: Sorted; heldBack: Sorted }) {
  return (
    <div className="grid gap-3 @lg:grid-cols-2">
      <p className="rounded-lg border-l-4 border-machine bg-card px-3 py-2 text-caption">
        <span className="font-semibold">{onBench.label}</span> {onBench.text}
      </p>
      <p className="rounded-lg border-l-4 border-(--warning) bg-card px-3 py-2 text-caption">
        <span className="font-semibold text-(--warning)">{heldBack.label}</span> {heldBack.text}
      </p>
    </div>
  );
}
