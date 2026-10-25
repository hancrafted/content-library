import { parse } from 'yaml';
import type { z } from 'zod';

/*
 * The frontmatter of an evidence file (a research file, a Concept file): the YAML between the opening `---` lines,
 * parsed, and the body after it. A file that cannot be read yields a reason, never a throw.
 */

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

/** A file's parsed frontmatter and its body, or the one reason it has none. */
export function readFrontmatter(markdown: string): { data: unknown; body: string } | { reason: string } {
  const match = FRONTMATTER.exec(markdown);
  if (match === null) return { reason: 'the file has no frontmatter' };
  try {
    return { data: parse(match[1]), body: markdown.slice(match[0].length) };
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : 'unreadable';
    return { reason: `the frontmatter is not valid YAML: ${reason}` };
  }
}

/** Zod issues as one sentence each, prefixed with the field they concern. */
export function reasonsOf(issues: readonly z.core.$ZodIssue[]): string[] {
  return issues.map((issue) => `${issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''}${issue.message}`);
}
