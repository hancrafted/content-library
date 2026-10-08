import { join } from 'node:path';
import nextConfig from '../../next.config';

export const OUT_DIR = join(import.meta.dirname, '..', '..', 'out');

/** The file `next build` writes for a URL: `trailingSlash` puts `/de` at `de/index.html`, else `de.html`. */
export function exportedFile(url: string): string {
  if (url === '/') return 'index.html';
  const path = url.slice(1);
  return nextConfig.trailingSlash ? join(path, 'index.html') : `${path}.html`;
}
