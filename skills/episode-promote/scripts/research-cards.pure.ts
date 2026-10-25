// The Promotion Gate's research cards (design-ADR 0016, Pipeline and evidence rule 9): one card per staged Research
// question, showing the `confidence` and `informs` its writer proposed and the writer's one-line reason, for Han to
// confirm or change. `harvest-report.ts` adds them to the Harvest report as their own section; a kept card is applied
// as Han's `verified` entry in the question's file (episode-promote step 6). Pure: the staged files in, the section out.

import { readFrontmatter } from '../../../src/lib/frontmatter.pure.ts';
import type { Card, Section } from './harvest-report.pure.ts';

/** One staged research file, by repo path. */
export interface StagedResearch {
  path: string;
  markdown: string;
}

/** `a`, `a and b`, `a, b and c`. */
function listed(items: readonly string[]): string {
  return items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

/** What a card shows of a research file's frontmatter, as written; the content store checks the values. */
function proposalOf(markdown: string): { title: string; confidence: string; reason: string; informs: string } {
  const front = readFrontmatter(markdown);
  const data = ('reason' in front ? {} : (front.data ?? {})) as Record<string, unknown>;
  return {
    title: String(data.title ?? ''),
    confidence: String(data.confidence ?? 'no confidence'),
    reason: String(data.confidence_reason ?? 'no reason given.'),
    informs: listed(Array.isArray(data.informs) ? data.informs.map(String) : []),
  };
}

function card({ path, markdown }: StagedResearch, at: number): Card {
  const { title, confidence, reason, informs } = proposalOf(markdown);
  const proposal = `${confidence}, informs ${informs}`;
  const id = (path.split('/').at(-2) ?? '').split('__')[0];
  return {
    id: `Q${at + 1}`,
    title: `Confirm that the evidence for "${title}" is ${confidence}, and that it informs ${informs}.`,
    changes: path,
    happened: `The writer rated the evidence ${confidence}: ${reason}`,
    change:
      'Keep the card to confirm both. Write a different confidence or other Concepts in its note to change them first.',
    gain: 'Only evidence you have checked reaches the wiki.',
    before: { kind: 'quote', text: `${proposal} (proposed by the writer)` },
    after: { kind: 'quote', text: `${proposal} (confirmed by you)` },
    evidence: `${id} · ${path}`,
  };
}

/** The Harvest report's research section: a card per staged question, in the order given. */
export function researchSection(staged: readonly StagedResearch[]): Section {
  return {
    key: 'research',
    title: 'Research questions',
    target: "verified: { by: human:han } in each question's research.md",
    cards: staged.map(card),
  };
}
