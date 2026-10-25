/*
 * The Research questions the content store holds, read across records: whether each informs real Concepts, and
 * which ones a Concept page lists.
 */

/** What a list of Research questions needs of each: its id, the Concepts it informs and whether it is staged. */
export interface ResearchSummary {
  readonly id: string;
  /** The Concepts it informs, the first its main one. */
  readonly informs: readonly string[];
  readonly staged: boolean;
}

/**
 * Every promoted Research question that informs a Concept, those whose main Concept it is first, each group in the
 * order given. A staged question is left out: it has no page until Promotion (design-ADR 0016, Citations rule 12).
 */
export function researchInforming<R extends ResearchSummary>(research: readonly R[], concept: string): R[] {
  const informing = research.filter(({ staged, informs }) => !staged && informs.includes(concept));
  return [
    ...informing.filter(({ informs }) => informs[0] === concept),
    ...informing.filter(({ informs }) => informs[0] !== concept),
  ];
}

/** One problem per `informs` id that names no Concept, against the Research question's id. */
export function informsProblems(
  research: readonly Pick<ResearchSummary, 'id' | 'informs'>[],
  concepts: readonly string[],
): { record: string; message: string }[] {
  return research.flatMap(({ id, informs }) =>
    informs
      .filter((concept) => !concepts.includes(concept))
      .map((concept) => ({ record: id, message: `informs names ${concept}, which is no Concept` })),
  );
}
