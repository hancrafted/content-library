/*
 * The three values of a Research question's confidence and what each means, written once: the research schema
 * allows exactly these, and the Research page shows the definition beside the badge.
 */

/**
 * How settled the evidence for a Research question's Answer is (design-ADR 0016, Citations rule 4). The agent that
 * writes the research proposes one; Han confirms it at the Promotion Gate.
 */
export const CONFIDENCE_DEFINITIONS = {
  settled:
    'The Answer rests on at least two independent primary Sources that agree, and no Source or Caveat contradicts it.',
  contested: 'Credible primary Sources disagree, or the effect is real but depends on context the Answer names.',
  open: 'Anything less: one Source, only weak Sources, or a mechanism still debated.',
} as const;

export type Confidence = keyof typeof CONFIDENCE_DEFINITIONS;

export const CONFIDENCES = Object.keys(CONFIDENCE_DEFINITIONS) as [Confidence, ...Confidence[]];
