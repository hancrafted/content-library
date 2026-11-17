import { setArtHrefs } from '@/episodes/lib/art-href.pure';
import { useEffect, type RefObject } from 'react';

// decision: FE-009 §4
// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
export function useArtLoader(root: RefObject<HTMLElement | null>, loads: boolean): void {
  useEffect(() => {
    const element = root.current;
    if (!loads || element === null) return;
    setArtHrefs(element);
    const observer = new MutationObserver(() => setArtHrefs(element));
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [root, loads]);
  useEffect(() => {
    const element = root.current;
    if (element === null) return;
    const beforePrint = () => setArtHrefs(element);
    window.addEventListener('beforeprint', beforePrint);
    return () => window.removeEventListener('beforeprint', beforePrint);
  }, [root]);
}
