/*
 * The Spec's words as markup (design-ADR 0011): the Dossier's Voice script, Speaker notes with their citations in
 * full and Visual idea, and the CSS-only tabs that hold them on a Slide. Escapes everything it prints.
 */

import { type Item } from './episode-spec-source.pure.ts';

export const escape = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline markdown the Dossier uses: bold, code and emphasis. */
export function inline(text: string): string {
  return escape(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/(?<![\w*])_(.+?)_(?![\w*])/g, '<em>$1</em>');
}

const SOURCE_ENTRY = /^\[(\d+)\] (.*?) — (\S+)$/;

function sourceItems(line: string): string[] {
  return line
    .slice('sources: '.length)
    .split(/;\s*(?=\[\d+\])/)
    .map((entry) => {
      const match = SOURCE_ENTRY.exec(entry.trim());
      if (match === null) return `<li>${inline(entry)}</li>`;
      const [, n = '', title = '', url = ''] = match;
      return `<li data-source="${n}">[${n}] ${inline(title)} — <a href="${escape(url)}">${escape(url)}</a></li>`;
    });
}

export function voiceList(items: readonly Item[] | undefined): string {
  if (items === undefined) return '';
  return `<ol data-spec="voice-script">\n${items.map(({ text }) => `<li>${inline(text)}</li>`).join('\n')}\n</ol>`;
}

export function notesList(items: readonly Item[]): string {
  const rows = items.map(({ text, subs }) => {
    const subLines = subs.flatMap((sub) =>
      sub.startsWith('sources: ') ? sourceItems(sub) : [`<li>${inline(sub)}</li>`],
    );
    return `<li>\n${inline(text)}${subLines.length > 0 ? `\n<ul>\n${subLines.join('\n')}\n</ul>` : ''}\n</li>`;
  });
  return `<ol data-spec="speaker-notes">\n${rows.join('\n')}\n</ol>`;
}

const DESIGN_LINE = /^(master:|Design reference:|title:)/;

export function visualPanel(paragraphs: readonly string[]): string {
  return paragraphs
    .map((paragraph) =>
      DESIGN_LINE.test(paragraph)
        ? `<p class="text-caption"><code>${escape(paragraph)}</code></p>`
        : `<p data-spec="visual-idea">${inline(paragraph)}</p>`,
    )
    .join('\n');
}

const TABS = [
  ['visual-idea', 'Visual idea'],
  ['voice-script', 'Voice script'],
  ['speaker-notes', 'Speaker notes'],
] as const;

/** A Slide's words as CSS-only tabs, each panel only when its words exist. */
export function wordTabs(slug: string, panels: Record<(typeof TABS)[number][0], string>): string {
  const shown = TABS.filter(([name]) => panels[name] !== '');
  if (shown.length === 0) return '';
  const radios = shown.map(
    ([name, label], at) =>
      `<input type="radio" name="words:${slug}" id="${slug}--${name}" value="${name}"${at === 0 ? ' checked' : ''} />\n<label for="${slug}--${name}">${label}</label>`,
  );
  const cards = shown.map(
    ([name, label]) =>
      `<div class="spec-card spec-panel" data-panel="${name}">\n<h4>${label}</h4>\n${panels[name]}\n</div>`,
  );
  return `<div class="spec-words">\n${[...radios, ...cards].join('\n')}\n</div>`;
}
