import { setArtHrefs } from '@/episodes/lib/art-href.pure';
import { useEffect, type RefObject } from 'react';

/**
 * Loads the Scene art under `root` (FE-009 §4, design-ADR 0025): every `<use>` gets its `href` once `loads` turns
 * true, including art a later render adds, such as a replay or a view switch; and every `<use>` before the page
 * prints, so a printed page carries its art (decision 69). The Slide's mount and a Backdrop Scene's client root each
 * call it once; no `<use>` is a client component of its own.
 */
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
