/*
 * The Speaker notes of a Dossier (design-ADR 0016, Pipeline and evidence rule 8): each item cites its claim, by
 * default a Research question by id, `[AIE-0001]` with a nested `research: AIE-0001` line, and a high-trust Source
 * directly only as `[n]` with a nested `sources: [n] title — URL` line. The id is one the research plan names, reused
 * or written by a job of this Run, and every question the plan reuses is cited somewhere: an empty Research Stage is
 * normal only because the proof is already there (rule 5).
 */

import { unless, type Finding } from './finding.pure';
import { readResearchPlan } from './research-plan.pure';
import { h4s, orderedList, type Block, type ListItem } from './staging-markdown.pure';

const SPEAKER_NOTE_ITEM = /^\*\*[^*]+\*\* — \S.*$/;
const SOURCE = /^sources: \[(\d+)\] \S.* — \S+$/;
const RESEARCH = /^research: ([A-Z]+-\d{4})$/;
const TARGET = /^target: \S.*$/;
const CITATION = /\[(\d+|[A-Z]+-\d{4})\]/g;
const FORMS = '"research: <id>" or "sources: [n] title — URL"';

function checkSpeakerNote(where: string, { text, nested }: ListItem): string[] {
  if (!SPEAKER_NOTE_ITEM.test(text))
    return [`${where} has an item not of the form "**header** — description [id]": "${text}".`];
  const sources = nested.flatMap((line) => SOURCE.exec(line)?.[1] ?? RESEARCH.exec(line)?.[1] ?? []);
  const unknown = nested.filter((line) => ![SOURCE, RESEARCH, TARGET].some((form) => form.test(line)));
  const targets = nested.filter((line) => TARGET.test(line));
  const unresolved = [...text.matchAll(CITATION)]
    .map(([citation, n]) => ({ citation, n }))
    .filter(({ n }) => !sources.includes(n));
  return [
    ...unless(sources.length > 0, `${where}: "${text}" has no nested ${FORMS} line.`),
    ...unknown.map(
      (line) => `${where}: "${text}" has a nested line that is neither ${FORMS} nor "target:": "${line}".`,
    ),
    ...unless(targets.length <= 1, `${where}: "${text}" has more than one "target:" line.`),
    ...unresolved.map(({ citation }) => `${where}: "${text}" cites ${citation}, which resolves to no nested source.`),
  ];
}

/**
 * The Research question ids the plan names: each one it reuses, by its question (none for one a kept Slide cites,
 * which the Slide goes on citing), and each one a job writes.
 */
function plannedIds(plan: string): { reused: Map<string, number | undefined>; written: Set<string> } {
  const items = readResearchPlan(plan);
  const reused = new Map<string, number | undefined>();
  for (const item of items)
    if (item.kind === 'reuse' && reused.get(item.id) === undefined) reused.set(item.id, item.question);
  return {
    reused,
    written: new Set(items.flatMap((item) => (item.kind === 'reuse' ? [] : [item.folder.split('__')[0]]))),
  };
}

/** The ids each Slide's Speaker notes cite by a `research:` line, by the Slide's slug. */
function citedIds(blocks: readonly Block[]): Map<string | null, string[]> {
  return new Map(
    h4s(blocks, 'Speaker notes').map(({ owner, body }) => [
      owner,
      orderedList(body).items.flatMap(({ nested }) => nested.flatMap((line) => RESEARCH.exec(line)?.[1] ?? [])),
    ]),
  );
}

/** Against the research plan: every cited id is one it names, every id it reuses is cited. No plan, no check. */
function checkAgainstPlan(blocks: readonly Block[], plan: string | undefined): string[] {
  if (plan === undefined) return [];
  const { reused, written } = plannedIds(plan);
  const cited = citedIds(blocks);
  const all = new Set([...cited.values()].flat());
  const unplanned = [...cited].flatMap(([owner, ids]) =>
    [...new Set(ids)]
      .filter((id) => !reused.has(id) && !written.has(id))
      .map(
        (id) =>
          `The Speaker notes of {#${owner}} cite ${id}, which the research plan neither reuses nor writes; the Dossier cites only the research the plan names.`,
      ),
  );
  const uncited = [...reused]
    .filter(([id, question]) => question !== undefined && !all.has(id))
    .map(
      ([id, question]) =>
        `The research plan reuses ${id} for question ${question}, which no Speaker note cites by \`research: ${id}\`; cite it where the Slide makes its claim, or retrieval should not have reused it.`,
    );
  return [...unplanned, ...uncited];
}

/** Every Speaker notes block of the Dossier, each item's form and citations, then the citations against the plan. */
export function checkSpeakerNotes(blocks: readonly Block[], plan: string | undefined): Finding[] {
  const perSlide = h4s(blocks, 'Speaker notes').flatMap(({ owner, body }) => {
    const where = `The Speaker notes of {#${owner}}`;
    const { items, strays } = orderedList(body);
    return [
      ...strays.map((line) => `${where} hold a line outside the ordered list: "${line}".`),
      ...items.flatMap((item) => checkSpeakerNote(where, item)),
    ];
  });
  return [...perSlide, ...checkAgainstPlan(blocks, plan)].map((message): Finding => ({
    kind: 'speaker-note',
    file: 'dossier.md',
    message,
  }));
}
