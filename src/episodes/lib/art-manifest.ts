import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * What `npm run art` writes beside the files (FE-005 §5): each art name's URL under `/art/`, or `null` for a name a
 * Slide's CSS repaints, which stays inline.
 */
export type ArtManifest = Readonly<Record<string, string | null>>;

/** How `<Art>` draws: a `<use>` from the manifest, marked inline for the art build, or plainly inline. */
export type ArtMode = { readonly mode: 'use'; readonly manifest: ArtManifest } | { readonly mode: 'mark' | 'inline' };

const MANIFEST = path.join(process.cwd(), 'public/art/manifest.json');
let built: ArtManifest | undefined;

/**
 * How Scene art draws in this process: from the manifest in a production build, read once; marked for the bake while
 * `npm run art` renders (`ART_BUILD`); inline in `next dev` and the tests, so a redraw shows at once and a figure's
 * tests read its markup.
 */
export function artMode(): ArtMode {
  if (process.env.ART_BUILD === '1') return { mode: 'mark' };
  if (process.env.NODE_ENV !== 'production') return { mode: 'inline' };
  built ??= JSON.parse(readFileSync(MANIFEST, 'utf8')) as ArtManifest;
  return { mode: 'use', manifest: built };
}
