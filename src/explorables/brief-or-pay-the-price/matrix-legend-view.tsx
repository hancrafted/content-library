import type { MirrorRow } from './brief-or-pay-the-price.types';

function Entries({ rows }: { readonly rows: readonly MirrorRow[] }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {rows.map(({ id, letter, words }) => (
        <li key={id}>
          <b translate="no" className="font-semibold">
            {letter}
          </b>{' '}
          <span translate="no">{words.name}</span>
          {words.gloss === '' ? null : (
            <i lang="de" className="text-muted-foreground">
              {' '}
              {words.gloss}
            </i>
          )}
        </li>
      ))}
    </ul>
  );
}

// decision: FE-012 §4.5
export function MatrixLegendView({
  title,
  traits,
  moves,
}: {
  readonly title: string;
  readonly traits: readonly MirrorRow[];
  readonly moves: readonly MirrorRow[];
}) {
  return (
    <section aria-label={title} data-matrix-legend className="flex flex-col gap-1 text-caption @3xl:hidden">
      <Entries rows={traits} />
      <Entries rows={moves} />
    </section>
  );
}
