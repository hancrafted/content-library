import type { Handoff } from '../handoff.pure';
import type { OutputWords } from './output-words';

type Comparison = Extract<Handoff, { kind: 'comparison' }>;

function Row({ row, at }: { row: Comparison['ranking'][number]; at: number }) {
  const first = at === 0;
  return (
    <tr data-rank={at + 1} className={`border-b border-border last:border-b-0 ${first ? 'bg-(--success)/10' : ''}`}>
      <td className="px-4 py-3">
        <span
          className={`flex size-7 items-center justify-center rounded-full text-caption font-semibold ${
            first ? 'bg-(--success) text-(--success-foreground)' : 'bg-muted text-muted-foreground'
          }`}
        >
          {at + 1}
        </span>
      </td>
      <th scope="row" className="px-4 py-3 font-semibold text-foreground">
        {row.name}
      </th>
      <td className="px-4 py-3 text-muted-foreground">{row.why}</td>
    </tr>
  );
}

function Head({ words }: { words: OutputWords }) {
  return (
    <thead>
      <tr className="border-b border-border bg-muted text-caption font-semibold text-muted-foreground uppercase">
        <th scope="col" className="w-12 px-4 py-2">
          {words.rank}
        </th>
        <th scope="col" className="px-4 py-2">
          {words.option}
        </th>
        <th scope="col" className="px-4 py-2">
          {words.why}
        </th>
      </tr>
    </thead>
  );
}

/** The ranked table: the winner first and marked, the criteria it was ranked by as chips above. */
export function ComparisonView({ comparison, words }: { comparison: Comparison; words: OutputWords }) {
  return (
    <section data-output="comparison" className="flex flex-col gap-3">
      <ul aria-label={words.criteria} className="flex flex-wrap gap-2">
        {comparison.criteria.map((criterion) => (
          <li key={criterion} className="rounded-full bg-muted px-3 py-1 text-caption font-medium text-foreground">
            {criterion}
          </li>
        ))}
      </ul>
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-md">
        <table className="w-full border-collapse text-left text-body">
          <caption className="sr-only">{words.ranking}</caption>
          <Head words={words} />
          <tbody>
            {comparison.ranking.map((row, at) => (
              <Row key={row.name} row={row} at={at} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
