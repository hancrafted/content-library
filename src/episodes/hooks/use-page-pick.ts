import { createContext, useContext } from 'react';

export type PickName = 'os' | 'agent';

export interface PagePicks {
  readonly picks: Readonly<Partial<Record<PickName, string>>>;
  readonly setPick: (name: PickName, value: string) => void;
}

// decision: FE-001 §1
export const PagePicksContext = createContext<PagePicks | null>(null);

const NO_PICK = () => undefined;

export function usePagePick(name: PickName, fallback: string): readonly [string, (value: string) => void] {
  const page = useContext(PagePicksContext);
  const value = page?.picks[name] ?? fallback;
  return [value, page ? (next: string) => page.setPick(name, next) : NO_PICK] as const;
}
