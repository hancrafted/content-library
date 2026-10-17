/*
 * The Spec's Brief card markup (design-ADR 0011): the Brief's headings as paragraphs and lists, a note field each,
 * read-only once the Brief is approved.
 */

import { escape, inline } from './episode-spec-assemble-words.pure.ts';
import { briefCard, type BriefCardEntry } from './episode-spec-brief.pure.ts';
import { FORM } from './episode-spec-slide.pure.ts';

/** A card entry's lines as paragraphs, with list lines (`- `, `1. `) grouped into one list. */
function briefLines(lines: readonly string[]): string {
  const item = (line: string) => /^(?:- |\d+\. )/.test(line);
  const out: string[] = [];
  let list: string[] = [];
  const close = () => {
    if (list.length > 0)
      out.push(`<ul>${list.map((line) => `<li>${inline(line.replace(/^(?:- |\d+\. )/, ''))}</li>`).join('')}</ul>`);
    list = [];
  };
  for (const line of lines) {
    if (item(line)) list.push(line);
    else {
      close();
      if (line.trim() !== '') out.push(`<p>${inline(line.trim())}</p>`);
    }
  }
  close();
  return out.join('\n');
}

function briefEntry({ heading, key, lines }: BriefCardEntry, approved: boolean): string {
  const note = approved
    ? ''
    : `\n<textarea class="spec-note" form="${FORM}" name="note:${key}" placeholder="Note on ${escape(heading)}"></textarea>`;
  return `<div data-spec="brief-entry" id="${key}">\n<h3>${escape(heading)}</h3>\n${briefLines(lines)}${note}\n</div>`;
}

/** The Brief card: the Brief's goals with a note field each, read-only once the Brief is approved. */
export function briefCardMarkup(brief: string): string {
  const { entries, approved } = briefCard(brief);
  if (entries.length === 0) return '';
  return `<section id="brief" data-spec="brief-card"${approved ? ' data-locked' : ''} class="spec-card">\n<h2>Brief</h2>\n${entries
    .map((entry) => briefEntry(entry, approved))
    .join('\n')}\n</section>`;
}
