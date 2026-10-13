/*
 * The write-voice-script check (design-ADR 0004): the job may rewrite the text
 * of Voice script items in the Dossier and nothing else. The rule lives in
 * references/write-voice-script.md prose; this compares two versions of the
 * file, and the staging test runs it on write-dossier's commit and its successor.
 */

import { type Finding } from './finding.pure';
import { blocksOf, bodyLines, orderedList } from './staging-markdown.pure';

const BEAT = /^\*\*(.+?)\*\*/;

/** A Dossier's non-blank lines outside every Voice script block, and each Slide's Voice script beats. */
function splitVoiceScript(dossier: string): { rest: string[]; beats: Map<string, string[]> } {
  const lines = bodyLines(dossier);
  const blocks = blocksOf(lines);
  const voiced = new Set(blocks.filter(({ heading }) => heading.level === 4 && heading.text === 'Voice script'));
  const inVoice = new Set(
    blocks
      .filter((block) => voiced.has(block))
      .flatMap(({ heading, body }) => Array.from({ length: body.length + 1 }, (_, i) => heading.line + i)),
  );
  const beats = new Map(
    [...voiced].map(({ owner, body }) => [
      owner ?? '',
      orderedList(body).items.map(({ text }) => BEAT.exec(text)?.[1] ?? text),
    ]),
  );
  return { rest: lines.filter((line, index) => line.trim() !== '' && !inVoice.has(index)), beats };
}

/**
 * Checks what write-voice-script did to the Dossier write-dossier left: it may
 * rewrite the text of each Voice script item and nothing else, so every other
 * line, and every item's bold beat and order, stay as they were.
 */
export function checkVoiceScriptDiff(draft: string, voiced: string): Finding[] {
  const before = splitVoiceScript(draft);
  const after = splitVoiceScript(voiced);
  const finding = (message: string): Finding => ({ kind: 'voice-script', file: 'dossier.md', message });
  const at = before.rest.findIndex((line, index) => after.rest[index] !== line);
  const departs = at !== -1 || after.rest.length !== before.rest.length;
  const index = at === -1 ? before.rest.length : at;
  const outside = departs
    ? [
        finding(
          `write-voice-script changed a line outside the Voice script: the Dossier had "${before.rest[index] ?? 'no further line'}", it has "${after.rest[index] ?? 'no further line'}". Only the text of Voice script items may change.`,
        ),
      ]
    : [];
  const slides = [...new Set([...before.beats.keys(), ...after.beats.keys()])];
  const items = slides.flatMap((slug) => {
    const was = before.beats.get(slug) ?? [];
    const is = after.beats.get(slug) ?? [];
    if (was.join('\n') === is.join('\n')) return [];
    return [
      finding(
        `The Voice script of {#${slug}} had the beats [${was.join(' | ')}], it has [${is.join(' | ')}]: keep each bold beat and the item order, and rewrite only the text after it.`,
      ),
    ];
  });
  return [...outside, ...items];
}
