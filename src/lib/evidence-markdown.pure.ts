import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { remarkCitations } from './remark-citations.pure';

/*
 * Evidence pages (design-ADR 0016, decision 3) render their Markdown through unified: remark parses it, remark-rehype
 * turns it into an HTML tree. This returns the tree, not HTML text, so a component renders it as React elements and
 * raw HTML in a file never reaches the page (remark-rehype drops it). No React here (FE-007 §3).
 */

export interface EvidenceTreeOptions {
  /** Leave out a leading h1: the page draws the title itself from the frontmatter. */
  readonly withoutTitle?: boolean;
  /**
   * The ids of the page's Sources (a research file's `sources[].id`). Given, each `[n]` marker links to the nth
   * Source, and a marker with no matching Source throws.
   */
  readonly sources?: readonly number[];
}

const base = unified().use(remarkParse).use(remarkRehype);

/** An HTML tree (hast) as remark-rehype hands it on. */
export type EvidenceTree = ReturnType<typeof base.runSync>;

type Mdast = ReturnType<typeof base.parse>;

/** Leaves out a leading h1. */
function remarkWithoutTitle() {
  return (tree: Mdast) => {
    const first = tree.children[0];
    if (first?.type === 'heading' && first.depth === 1) tree.children.shift();
  };
}

/** The HTML tree of an evidence file's Markdown body. */
export function evidenceTree(markdown: string, options: EvidenceTreeOptions = {}): EvidenceTree {
  const transform = unified()
    .use(options.withoutTitle ? [remarkWithoutTitle] : [])
    .use(options.sources ? [[remarkCitations, { sources: options.sources }]] : [])
    .use(remarkRehype);
  return transform.runSync(base.parse(markdown));
}
