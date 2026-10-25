/**
 * Every promoted Research question id, one page each at `/research/<id>`, in English only (design-ADR 0016, Citations
 * rule 1); `routes.ts` turns each into a page. The ids are the folder names under `docs/llm-wiki/research/<category>/`.
 * Staged research has no page until Promotion moves it there and adds its id here; the content store test fails when
 * the two differ.
 */
export const RESEARCH_IDS = [
  'AIE-0001',
  'AIE-0002',
  'AIE-0003',
  'AIE-0004',
  'AIE-0005',
  'AIE-0006',
  'AIE-0007',
  'AIE-0008',
  'AIE-0009',
  'AIE-0010',
  'AIE-0011',
  'LLM-0001',
  'LLM-0002',
  'LLM-0003',
  'LLM-0004',
  'LLM-0005',
  'ORG-0001',
  'SALES-0001',
  'SALES-0002',
  'SALES-0003',
  'SALES-0004',
  'SALES-0005',
  'SALES-0006',
  'START-0001',
] as const;

export type ResearchId = (typeof RESEARCH_IDS)[number];

export function isResearchId(id: string): id is ResearchId {
  return (RESEARCH_IDS as readonly string[]).includes(id);
}
