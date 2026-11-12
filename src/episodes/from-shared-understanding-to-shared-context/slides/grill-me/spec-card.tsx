import { DocumentIcon } from '@/episodes/components/slide-shared/factory-line/icons';

export interface SpecCardProps {
  readonly title: string;
  readonly rows: readonly { readonly slug: string; readonly term: string; readonly value: string }[];
}

/** The spec the interview ends in, a one-page work order: the card in `primary`, its icon in `machine`. */
export function SpecCard({ title, rows }: SpecCardProps) {
  return (
    <article
      data-spec-card
      className="card-hover card-hover--raise rotate-1 rounded-lg border-2 border-primary bg-card p-5 shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-body font-semibold">{title}</p>
        <DocumentIcon tone="machine" className="h-7 w-6" />
      </div>
      <dl className="mt-3 flex flex-col gap-2 text-caption">
        {rows.map(({ slug, term, value }) => (
          <div key={slug}>
            <dt className="font-semibold">{term}</dt>
            <dd className="text-muted-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
