/*
 * Scene art's one client step (FE-009 §4, design-ADR 0025): a `<use>` reaches the static HTML with its file's URL in
 * `data-art` and no `href`, so nothing is fetched until its Scene's client root copies the URL over.
 */

/** The `<use>` elements of Scene art not yet pointed at their file. */
const UNLOADED = 'use[data-art]:not([href])';

interface ArtUse {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
}

/** Points every unloaded art `<use>` under `root` at its file, which the browser then fetches once and caches. */
export function setArtHrefs(root: { querySelectorAll(selector: string): Iterable<ArtUse> }): void {
  for (const use of root.querySelectorAll(UNLOADED)) {
    const url = use.getAttribute('data-art');
    if (url !== null) use.setAttribute('href', url);
  }
}

/**
 * The same step as an inline script, for the Title slide's Scene: it runs as the HTML parses, so the first paint
 * never waits for hydration. It loads the art of the Scene root it sits in.
 */
export const ART_NOW_SCRIPT = `(function(s){var r=s&&s.closest('[data-art-root]');if(r)r.querySelectorAll('${UNLOADED}').forEach(function(u){u.setAttribute('href',u.getAttribute('data-art'))})})(document.currentScript)`;
