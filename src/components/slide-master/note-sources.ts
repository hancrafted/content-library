import type { CitedResearch } from '@/lib/citations.pure';
import type { NoteSource } from '@/lib/context-drawer.pure';
import { researchRoute } from '@/lib/routes';
import type { SourceSpec } from './slide-base';

/*
 * A Speaker note's sources as the drawer shows them (design-ADR 0016, Citations rules 7 and 12): a cited Research
 * question lends its title, confidence and page; a Source cited directly keeps its title in the Slide's text.
 */

/**
 * A cited Research question as the note shows it: its title and confidence, and a link to its page, which is English
 * only, so a German note links there too. A staged question has no page until Promotion, so no link.
 */
function researchSourceOf(slug: string, id: string, research: readonly CitedResearch[]): NoteSource {
  const cited = research.find((each) => each.id === id && !each.staged) ?? research.find((each) => each.id === id);
  if (cited === undefined) throw new Error(`Source "${slug}" cites ${id}, which is no Research question.`);
  const { title, confidence, staged } = cited;
  return { slug, research: id, title, confidence, ...(!staged && { page: { path: researchRoute(id), locale: 'en' } }) };
}

/** Each source of a note, in order; `titleOf` reads a directly cited Source's title from the Slide's own text. */
export function noteSourcesOf(
  specs: readonly SourceSpec[],
  titleOf: (slug: string) => string,
  research: readonly CitedResearch[],
): NoteSource[] {
  return specs.map((spec) =>
    spec.research === undefined
      ? { slug: spec.slug, url: spec.url, title: titleOf(spec.slug) }
      : researchSourceOf(spec.slug, spec.research, research),
  );
}
