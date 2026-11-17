import { readFileSync } from 'node:fs';
import path from 'node:path';

// decision: FE-005 §5
export type ArtManifest = Readonly<Record<string, string | null>>;

export type ArtMode = { readonly mode: 'use'; readonly manifest: ArtManifest } | { readonly mode: 'mark' | 'inline' };

const MANIFEST = path.join(process.cwd(), 'public/art/manifest.json');
let built: ArtManifest | undefined;

export function artMode(): ArtMode {
  if (process.env.ART_BUILD === '1') return { mode: 'mark' };
  if (process.env.NODE_ENV !== 'production') return { mode: 'inline' };
  built ??= JSON.parse(readFileSync(MANIFEST, 'utf8')) as ArtManifest;
  return { mode: 'use', manifest: built };
}
