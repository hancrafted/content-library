/*
 * The markdown handoff: front matter with a `kind`, one H1, then H2 sections. A template is a handoff with the
 * sections left empty; a sample or example is checked against its template's kind and H2 headings. An H2 written
 * `<like this>` in a template stands for one or more sections of any title.
 */

export interface MarkdownHandoff {
  readonly kind: string | undefined;
  readonly h1: string | undefined;
  readonly h2: readonly string[];
}

const FRONT = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** The H1 and H2 headings of a markdown body; headings inside code fences do not count. */
function headings(body: string): { h1: string[]; h2: string[] } {
  const found = { h1: [] as string[], h2: [] as string[] };
  let fenced = false;
  for (const line of body.split(/\r?\n/)) {
    if (line.startsWith('```')) fenced = !fenced;
    if (fenced) continue;
    if (line.startsWith('# ')) found.h1.push(line.slice(2).trim());
    if (line.startsWith('## ')) found.h2.push(line.slice(3).trim());
  }
  return found;
}

/** The kind, H1 and H2 headings of a markdown handoff. */
export function readTemplate(source: string): MarkdownHandoff {
  const front = FRONT.exec(source);
  const kind = /^kind:\s*(\S+)\s*$/m.exec(front?.[1] ?? '')?.[1];
  const { h1, h2 } = headings(front ? source.slice(front[0].length) : source);
  return { kind, h1: h1[0], h2 };
}

const isPlaceholder = (heading: string): boolean => /^<.+>$/.test(heading);

/** Whether the sample's H2s follow the template's: literals in order, a placeholder taking one or more. */
function sectionsMatch(template: readonly string[], sample: readonly string[]): boolean {
  const [head, ...rest] = template;
  if (head === undefined) return sample.length === 0;
  if (!isPlaceholder(head)) return sample[0] === head && sectionsMatch(rest, sample.slice(1));
  return Array.from({ length: sample.length }, (_, at) => at + 1).some((taken) =>
    sectionsMatch(rest, sample.slice(taken)),
  );
}

/** Every way `source` departs from `template`, one sentence each; empty when it conforms. */
export function handoffProblems(source: string, template: MarkdownHandoff): string[] {
  const read = readTemplate(source);
  const problems: string[] = [];
  if (!FRONT.test(source)) problems.push('has no front matter with a kind');
  else if (read.kind !== template.kind) {
    problems.push(`has the kind "${String(read.kind)}" but its template has the kind "${String(template.kind)}"`);
  }
  if (read.h1 === undefined) problems.push('has no H1 title');
  if (!sectionsMatch(template.h2, read.h2)) {
    problems.push(`has the H2 sections [${read.h2.join(', ')}] where its template has [${template.h2.join(', ')}]`);
  }
  return problems;
}
