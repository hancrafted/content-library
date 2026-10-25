import type { EvidenceTree } from '@/lib/evidence-markdown.pure';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

/** The body of an evidence page: the HTML tree unified made from its Markdown, rendered as React elements. */
export function EvidenceBody({ tree }: { tree: EvidenceTree }) {
  return (
    <div
      data-evidence-body
      className="max-w-3xl space-y-4 text-body text-foreground text-pretty [&_a]:underline [&_h2]:pt-4 [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
    >
      {toJsxRuntime(tree, { Fragment, jsx, jsxs })}
    </div>
  );
}
