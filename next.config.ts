import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import fs from 'node:fs';
import path from 'node:path';

function getTransitionStyle(): string {
  try {
    const configPath = path.join(process.cwd(), 'src/shared/config.yaml');
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
  // `/de/` → `de/index.html`, which static hosts (Cloudflare Pages, GitHub Pages) serve without extension guessing.
  trailingSlash: true,
  images: { unoptimized: true },
  // `next dev` would otherwise rewrite AGENTS.md (a symlink target) when it detects an agent.
  agentRules: false,
  // Type-checking lives in the `static` CI lane (`npm run typecheck`) and `npm run verify` at pre-push, not in the build (FE-005 Compliance 5).
  typescript: { ignoreBuildErrors: true },
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_TRANSITION_STYLE: transitionStyle,
  },
  // An Explorable's data files (a Claude Code `.jsonl` log, a `.yml` config) are imported as text and parsed at
  // build time; `vitest.config.mts` loads them the same way (raw-text-files.mts).
  // Turbopack's default CSS chunking merges Slide stylesheets across routes, so each Episode page loaded other
  // Episodes' CSS; the graph strategy with a low request cost keeps each page close to its own (FE-004 §4.3).
  experimental: { cssChunking: { type: 'graph', requestCost: 5000 } },
  turbopack: {
    rules: {
      '*.jsonl': { type: 'raw' },
      '*.yml': { type: 'raw' },
    },
  },
};

const withNextIntl = createNextIntlPlugin('./src/page-assembly/i18n-request.ts');

export default withNextIntl(nextConfig);
