import { type Finding } from './finding.pure';
import { frontmatterValue } from './staging-file.pure';
import { bodyLines } from './staging-markdown.pure';

const FENCE = /^(```|~~~)/;
const DEFINITION = /^\[(\d+)\]:\s*<([^>]*)>(?:\s+".*")?\s*$/;
const CITATION = /\[(\d+)\](?!:)/g;
const FOOTNOTE = /\[\^([^\]\s]+)\]/g;
const INLINE_CODE = /`[^`]*`/g;

interface Body {
  cited: Set<number>;
  defined: Map<number, string>;
  footnotes: Set<string>;
}

/** What the body cites as `[n]` and defines as `[n]: <url> "title"`, outside code fences and inline code. */
function readBody(markdown: string): Body {
  const body: Body = { cited: new Set(), defined: new Map(), footnotes: new Set() };
  let fenced = false;
  for (const line of bodyLines(markdown)) {
    if (FENCE.test(line)) fenced = !fenced;
    if (fenced) continue;
    const definition = DEFINITION.exec(line);
    if (definition) {
      body.defined.set(Number(definition[1]), definition[2]);
      continue;
    }
    const prose = line.replace(INLINE_CODE, '');
    for (const match of prose.matchAll(CITATION)) body.cited.add(Number(match[1]));
    for (const match of prose.matchAll(FOOTNOTE)) body.footnotes.add(match[1]);
  }
  return body;
}

interface Source {
  id: unknown;
  resource: unknown;
}

function sourcesOf(markdown: string): Source[] {
  const sources = frontmatterValue(markdown, 'sources');
  if (!Array.isArray(sources)) return [];
  return sources.map((source) =>
    typeof source === 'object' && source !== null ? (source as Source) : { id: undefined, resource: undefined },
  );
}

type Report = (message: string) => Finding;

/** Findings on the ids themselves: each is an integer, and together they are 1..n. */
function idFindings(sources: readonly Source[], report: Report): Finding[] {
  const bad = sources.flatMap((source, index) =>
    Number.isInteger(source.id)
      ? []
      : [
          report(
            `The source at position ${index + 1} has id ${JSON.stringify(source.id)}: ids are the numbers 1..${sources.length}.`,
          ),
        ],
  );
  if (bad.length > 0) return bad;
  const ids = sources.map((source) => source.id as number).sort((a, b) => a - b);
  const contiguous = ids.every((id, index) => id === index + 1);
  return contiguous
    ? []
    : [report(`The source ids are [${ids.join(', ')}]: they must be the numbers 1..${sources.length}, each once.`)];
}

/** Findings on one source id: cited, defined, and defined with the source's own URL. */
function sourceFindings(id: number, resource: string, body: Body): string[] {
  const url = body.defined.get(id);
  if (!body.cited.has(id)) return [`The source [${id}] is cited by no [${id}]: cite it in a Finding, or remove it.`];
  if (url === undefined) {
    return [
      `The citation [${id}] has no definition: add a line "[${id}]: <${resource}> \\"title\\"" at the end of the file.`,
    ];
  }
  return url === resource
    ? []
    : [`The definition [${id}] points to ${url} but the source's resource is ${resource}: make them equal.`];
}

/**
 * A research file's frontmatter `sources` and its `[n]` citations agree (design-ADR 0005): ids are the numbers
 * 1..n, every cited `[n]` is a source with a definition, every source is cited, and each definition's URL is
 * the source's `resource`.
 */
export function checkResearchSources(file: string, markdown: string): Finding[] {
  const sources = sourcesOf(markdown);
  const body = readBody(markdown);
  const report: Report = (message) => ({ kind: 'research-sources', file, message });
  const known = new Map(
    sources.filter((s) => Number.isInteger(s.id)).map((s) => [s.id as number, String(s.resource ?? '')]),
  );
  const unknown = [...new Set([...body.cited, ...body.defined.keys()])]
    .filter((id) => !known.has(id))
    .sort((a, b) => a - b);
  return [
    ...idFindings(sources, report),
    ...[...body.footnotes].map((note) =>
      report(
        `The footnote [^${note}] is no longer the format: cite sources as [n] and define them as "[n]: <url> \\"title\\"".`,
      ),
    ),
    ...unknown.map((id) =>
      report(`The citation [${id}] names no source: add a sources entry with id ${id}, or fix the number.`),
    ),
    ...[...known].flatMap(([id, resource]) => sourceFindings(id, resource, body).map(report)),
  ];
}
