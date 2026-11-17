import type { ArtManifest } from '@/episodes/lib/art-manifest';

/**
 * The URL a `<use>` of the named art points at, or `null` for art that stays inline; a name the art build never drew
 * fails the build, naming it.
 */
export function artUrl(name: string, manifest: ArtManifest, basePath: string): string | null {
  const url = manifest[name];
  if (url === undefined) {
    throw new Error(
      `Scene art "${name}" is not in public/art/manifest.json: run \`npm run art\` before \`next build\`.`,
    );
  }
  return url === null ? null : `${basePath}${url}`;
}

export function artName(figure: string, data: unknown): string {
  const text = JSON.stringify(data);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193);
  }
  return `${figure}/${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
