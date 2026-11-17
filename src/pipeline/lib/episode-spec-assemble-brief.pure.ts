// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { collapsible, escape, inline } from './episode-spec-assemble-words.pure.ts';
import { briefCard, type BriefCardEntry } from './episode-spec-brief.pure.ts';
import { FORM } from './episode-spec-slide.pure.ts';
import { ORDERED_MARKER } from './episode-spec-source.pure.ts';

const LIST_MARKER = new RegExp(`^(?:- |${ORDERED_MARKER.source.slice(1)})`);

function briefLines(lines: readonly string[]): string {
  const item = (line: string) => LIST_MARKER.test(line);
  const out: string[] = [];
  let list: string[] = [];
  const close = () => {
    if (list.length > 0)
      out.push(`<ul>${list.map((line) => `<li>${inline(line.replace(LIST_MARKER, ''))}</li>`).join('')}</ul>`);
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

export function briefCardMarkup(brief: string): string {
  const { entries, approved } = briefCard(brief);
  if (entries.length === 0) return '';
  const body = entries.map((entry) => briefEntry(entry, approved)).join('\n');
  return `<section id="brief" data-spec="brief-card"${approved ? ' data-locked' : ''} class="spec-card">\n${collapsible('Brief', body)}\n</section>`;
}
