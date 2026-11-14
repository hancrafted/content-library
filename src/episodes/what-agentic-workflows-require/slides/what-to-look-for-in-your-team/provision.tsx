import { OversightPill } from '@/episodes/components/slide-shared/oversight-pill/oversight-pill';

/** What the organisation gives: a title and either a line of words or the oversight pills. */
export function Provision(props: { slug: string; title: string; text?: string; pills?: readonly string[] }) {
  return (
    <li data-provision={props.slug} className="focus-group__item rounded-lg border border-border bg-card p-4 shadow-md">
      <p data-provision-title className="text-body font-semibold">
        {props.title}
      </p>
      {props.text !== undefined && <p className="text-caption text-muted-foreground">{props.text}</p>}
      {props.pills !== undefined && (
        <p className="mt-2 flex flex-wrap gap-2">
          {props.pills.map((pill) => (
            <OversightPill key={pill} label={pill} />
          ))}
        </p>
      )}
    </li>
  );
}
