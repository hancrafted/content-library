import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';

/** Conway's law in his own words, its author and year, and the hedges that keep it a tendency beside it. */
export function ConwayQuote(props: {
  quote: string;
  author: string;
  marker: ReactNode;
  hedges: readonly { slug: string; text: ReactNode }[];
  /** The Slide's targets for the notes aimed at the quote and at the hedges. */
  targets: { quote: TargetProps; hedges: TargetProps };
}) {
  return (
    <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-12">
      <blockquote {...props.targets.quote} className="border-l-4 border-primary pl-4 text-body @4xl:col-span-7">
        {props.quote}{' '}
        <span data-quote-author className="text-muted-foreground">
          {props.author}
        </span>
        {props.marker}
      </blockquote>
      <ul {...props.targets.hedges} className="flex flex-col gap-1 text-caption text-muted-foreground @4xl:col-span-5">
        {props.hedges.map(({ slug, text }) => (
          <li key={slug}>{text}</li>
        ))}
      </ul>
    </div>
  );
}
