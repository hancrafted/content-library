import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import fs from 'node:fs';
import path from 'node:path';

function getTransitionStyle(): string {
  try {
    const configPath = path.join(process.cwd(), 'src/config.yaml');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const match = raw.match(/^\s*transition_style\s*:\s*([a-zA-Z0-9_-]+)/m);
      if (match?.[1]) {
        return match[1].trim().toLowerCase();
      }
    }
  } catch {
    // default fallback
  }
  return 'liquid';
}

/**
 * Sub-path the site is served from, e.g. `/content-library` on
 * `<user>.github.io/content-library`. Empty when served from a domain root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const transitionStyle = getTransitionStyle();

const nextConfig: NextConfig = {
  output: 'export',
  // `/de/` → `de/index.html`, which GitHub Pages serves without extension guessing.
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_TRANSITION_STYLE: transitionStyle,
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
