import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

/*
 * Evidence pages (design-ADR 0016, decision 3) render their Markdown through unified: remark parses it, remark-rehype
 * turns it into an HTML tree. This returns the tree, not HTML text, so a component renders it as React elements and
 * raw HTML in a file never reaches the page (remark-rehype drops it). No React here (FE-007 §3).
 */

export interface EvidenceTreeOptions {
  /** Leave out a leading h1: the page draws the title itself from the frontmatter. */
  readonly withoutTitle?: boolean;
}

const processor = unified().use(remarkParse).use(remarkRehype);

/** An HTML tree (hast) as remark-rehype hands it on. */
export type EvidenceTree = ReturnType<typeof processor.runSync>;

/** The HTML tree of an evidence file's Markdown body. */
export function evidenceTree(markdown: string, options: EvidenceTreeOptions = {}): EvidenceTree {
  const mdast = processor.parse(markdown);
  if (options.withoutTitle) {
    const first = mdast.children[0];
    if (first?.type === 'heading' && first.depth === 1) mdast.children.shift();
  }
  return processor.runSync(mdast);
}
