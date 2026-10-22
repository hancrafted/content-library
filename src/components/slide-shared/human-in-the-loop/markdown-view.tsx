import { markdownBlocks, type MarkdownBlock } from './markdown-blocks.pure';

/*
 * The one markdown renderer of the visual: every example is a markdown handoff, so one reader draws them all. The
 * H1 is the title of the result, each H2 a part of it. Plain elements only: no HTML from the text is ever injected.
 */

const LIST = { ul: 'list-disc', ol: 'list-decimal' } as const;

function Block({ block }: { block: MarkdownBlock }) {
  if ('items' in block) {
    const List = block.kind;
    return (
      <List className={`${LIST[block.kind]} pl-5 text-caption`}>
        {block.items.map((item, at) => (
          <li key={at}>{item}</li>
        ))}
      </List>
    );
  }
  if (block.kind === 'h1') return <p className="text-body font-semibold">{block.text}</p>;
  if (block.kind === 'code') {
    return <pre className="rounded-md bg-muted p-2 text-caption whitespace-pre-wrap">{block.text}</pre>;
  }
  if (block.kind === 'p') return <p className="text-caption">{block.text}</p>;
  return <p className="mt-1 text-caption font-medium text-muted-foreground">{block.text}</p>;
}

/** A markdown text as the plain blocks of a handoff. */
export function MarkdownView({ markdown }: { readonly markdown: string }) {
  return (
    <div data-output="markdown" className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3">
      {markdownBlocks(markdown).map((block, at) => (
        <Block key={at} block={block} />
      ))}
    </div>
  );
}
