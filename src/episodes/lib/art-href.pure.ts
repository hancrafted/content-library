// decision: FE-009 §4
// decision: docs/adr/0025-scene-figures-are-deep-modules.md
const UNLOADED = 'use[data-art]:not([href])';

interface ArtUse {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
}

export function setArtHrefs(root: { querySelectorAll(selector: string): Iterable<ArtUse> }): void {
  for (const use of root.querySelectorAll(UNLOADED)) {
    const url = use.getAttribute('data-art');
    if (url !== null) use.setAttribute('href', url);
  }
}

export const ART_NOW_SCRIPT = `(function(s){var r=s&&s.closest('[data-art-root]');if(r)r.querySelectorAll('${UNLOADED}').forEach(function(u){u.setAttribute('href',u.getAttribute('data-art'))})})(document.currentScript)`;
