import { type Finding } from './finding.pure';
import { frontmatterValue } from './staging-file.pure';
import { bodyLines } from './staging-markdown.pure';

const FOOTNOTE = /\[\^([^\]\s]+)\](:?)/g;
const FENCE = /^(```|~~~)/;

/** The ids the body cites, and the ids it defines, outside code fences. */
function footnotesOf(markdown: string): { cited: Set<string>; defined: Set<string> } {
  const cited = new Set<string>();
  const defined = new Set<string>();
  let fenced = false;
  for (const line of bodyLines(markdown)) {
    if (FENCE.test(line)) fenced = !fenced;
    if (fenced) continue;
    for (const match of line.matchAll(FOOTNOTE)) {
      const isDefinition = match[2] === ':' && match.index === 0;
      (isDefinition ? defined : cited).add(match[1]);
    }
  }
  return { cited, defined };
}

function sourceIds(markdown: string): string[] {
  const sources = frontmatterValue(markdown, 'sources');
  if (!Array.isArray(sources)) return [];
  return sources.flatMap((source) => {
    const id = typeof source === 'object' && source !== null ? (source as { id?: unknown }).id : undefined;
    return typeof id === 'string' ? [id] : [];
  });
}

/**
 * A research file's frontmatter `sources[].id` and its `[^id]` footnotes agree in both directions
 * (design-ADR 0005): every footnote the body cites or defines is a source, every source is cited,
 * and every cited source has its definition.
 */
export function checkResearchSources(file: string, markdown: string): Finding[] {
  const ids = new Set(sourceIds(markdown));
  const { cited, defined } = footnotesOf(markdown);
  const finding = (message: string): Finding => ({ kind: 'research-sources', file, message });
  return [
    ...[...new Set([...cited, ...defined])]
      .filter((id) => !ids.has(id))
      .map((id) =>
        finding(`The footnote [^${id}] names no source: add a sources entry with id "${id}", or fix the id.`),
      ),
    ...[...ids]
      .filter((id) => !cited.has(id))
      .map((id) => finding(`The source "${id}" is cited by no [^${id}] footnote: cite it in a Finding, or remove it.`)),
    ...[...cited]
      .filter((id) => ids.has(id) && !defined.has(id))
      .map((id) =>
        finding(`The footnote [^${id}] has no definition: add a line "[^${id}]: <source>" at the end of the file.`),
      ),
  ];
}
