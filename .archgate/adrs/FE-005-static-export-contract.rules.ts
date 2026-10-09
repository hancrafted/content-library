/// <reference path="../rules.d.ts" />

// FE-005 — Static Export Contract. The parts of the contract that sit in
// source text and that an import-based eslint rule cannot see: per-segment
// exports, next.config keys, directives, segment exports, file names and
// folder names. Banned module imports live in eslint.config.mjs instead.
// Matched textually. Self-contained by design:
// archgate forbids imports between rules files.
const SRC_GLOB = 'src/**/*';
const ROOT_GLOB = '*';
// Next.js accepts any of these names; a legal rename must not crash the rule.
const NEXT_CONFIG_RE = /^next\.config\.(ts|js|mjs)$/;

const CODE_FILE_RE = /\.(ts|tsx|js|jsx|mjs)$/;
const SEGMENT_FILE_RE = /^src\/app\/(.+\/)?(page|layout)\.(tsx|ts|jsx|js)$/;
const DYNAMIC_SEGMENT_RE = /\/\[[^/]+\]\//;
const DYNAMIC_PARAMS_RE = /export\s+const\s+dynamicParams\s*=\s*false\b/;
const STATIC_PARAMS_RE = /export\s+(const|(async\s+)?function)\s+generateStaticParams\b/;

const OUTPUT_EXPORT_RE = /\boutput\s*:\s*['"]export['"]/;
const UNOPTIMIZED_RE = /\bunoptimized\s*:\s*true\b/;
const SERVER_CONFIG_RE = /\b(rewrites|redirects|headers)\s*(:|\()/g;

const USE_SERVER_RE = /^\s*['"]use server['"]/gm;
const REVALIDATE_RE = /export\s+const\s+revalidate\b/g;
const ROUTE_FILE_RE = /^src\/app\/(.+\/)?route\.(ts|js)$/;
const NON_GET_HANDLER_RE = /export\s+(?:async\s+function|function|const)\s+(HEAD|POST|PUT|PATCH|DELETE|OPTIONS)\b/g;
const GET_WITH_PARAM_RE = /export\s+(?:async\s+)?function\s+GET\s*\(\s*[^)\s]/g;
const INTERCEPTING_RE = /^src\/app\/(.+\/)?\(\.{1,3}\)/;
const PROXY_FILE_RE = /^(src\/)?(proxy|middleware)\.(ts|js|mjs)$/;

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

async function codeFiles(ctx: RuleContext, pattern: string): Promise<string[]> {
  return (await ctx.glob(pattern)).filter((file) => CODE_FILE_RE.test(file));
}

function reportMatches(ctx: RuleContext, file: string, source: string, re: RegExp, message: string): void {
  for (const match of source.matchAll(re)) {
    ctx.report.violation({ message, file, line: lineAt(source, match.index) });
  }
}

function checkFileNames(ctx: RuleContext, file: string): void {
  if (PROXY_FILE_RE.test(file)) {
    ctx.report.violation({
      message:
        'proxy/middleware runs per request and a static export has no server to run it — delete the file (FE-005 [no-request-time-features]).',
      file,
    });
  }
  if (INTERCEPTING_RE.test(file)) {
    ctx.report.violation({
      message:
        'Intercepting routes need request-time routing a static export lacks — give the view its own route instead (FE-005 [no-request-time-features]).',
      file,
    });
  }
}

function checkSource(ctx: RuleContext, file: string, source: string): void {
  reportMatches(
    ctx,
    file,
    source,
    USE_SERVER_RE,
    "'use server' declares a Server Action, which needs a runtime server — move the work to build time (FE-005 [no-request-time-features]).",
  );
  reportMatches(
    ctx,
    file,
    source,
    REVALIDATE_RE,
    'export const revalidate asks for ISR; a static export is built once — drop it and rebuild to refresh (FE-005 [no-request-time-features]).',
  );
  if (!ROUTE_FILE_RE.test(file)) return;
  reportMatches(
    ctx,
    file,
    source,
    NON_GET_HANDLER_RE,
    'A static export emits only GET route handlers — remove every other method (FE-005 [no-request-time-features]).',
  );
  reportMatches(
    ctx,
    file,
    source,
    GET_WITH_PARAM_RE,
    'A GET route handler that takes the Request reads it at request time — declare GET() with no parameter (FE-005 [no-request-time-features]).',
  );
}

function checkConfig(ctx: RuleContext, file: string, source: string): void {
  if (!OUTPUT_EXPORT_RE.test(source)) {
    ctx.report.violation({
      message: `${file} must set output: 'export' — the site deploys as static files (FE-005 [export-config-intact]).`,
      file,
    });
  }
  if (!UNOPTIMIZED_RE.test(source)) {
    ctx.report.violation({
      message: `${file} must set images: { unoptimized: true } — the default next/image loader optimises at request time (FE-005 [export-config-intact]).`,
      file,
    });
  }
  reportMatches(
    ctx,
    file,
    source,
    SERVER_CONFIG_RE,
    'rewrites, redirects and headers are applied by a Next.js server, which GitHub Pages is not — remove the key (FE-005 [export-config-intact]).',
  );
}

export default {
  rules: {
    'dynamic-segment-static-params': {
      description:
        'Every page and layout under a dynamic [segment] in src/app exports generateStaticParams and dynamicParams = false, so the exported path set is closed at build time.',
      severity: 'error',
      async check(ctx) {
        for (const file of await ctx.glob(SRC_GLOB)) {
          if (!SEGMENT_FILE_RE.test(file) || !DYNAMIC_SEGMENT_RE.test(file)) continue;
          const source = await ctx.readFile(file);
          if (!STATIC_PARAMS_RE.test(source)) {
            ctx.report.violation({
              message:
                'Dynamic segment file does not export generateStaticParams — export the full param list, e.g. export const generateStaticParams = prefixedLocaleParams (FE-005 [dynamic-segment-static-params]).',
              file,
            });
          }
          if (!DYNAMIC_PARAMS_RE.test(source)) {
            ctx.report.violation({
              message:
                'Dynamic segment file does not export dynamicParams = false — add export const dynamicParams = false so unlisted params 404 instead of rendering on demand (FE-005 [dynamic-segment-static-params]).',
              file,
            });
          }
        }
      },
    },
    'export-config-intact': {
      description:
        "next.config.{ts,js,mjs} exists, keeps output: 'export' and images.unoptimized: true, and declares no rewrites, redirects or headers.",
      severity: 'error',
      async check(ctx) {
        const configFile = (await ctx.glob(ROOT_GLOB)).find((file) => NEXT_CONFIG_RE.test(file));
        if (configFile === undefined) {
          ctx.report.violation({
            message:
              "No next.config.{ts,js,mjs} found — restore it with output: 'export' and images: { unoptimized: true } (FE-005 [export-config-intact]).",
          });
          return;
        }
        checkConfig(ctx, configFile, await ctx.readFile(configFile));
      },
    },
    'no-request-time-features': {
      description:
        "No file in src/ or at the root needs a request-time server: no proxy or middleware file, no intercepting route folder, no 'use server', no revalidate export, and route handlers are GET with no Request parameter.",
      severity: 'error',
      async check(ctx) {
        for (const file of await codeFiles(ctx, ROOT_GLOB)) checkFileNames(ctx, file);
        for (const file of await codeFiles(ctx, SRC_GLOB)) {
          checkFileNames(ctx, file);
          checkSource(ctx, file, await ctx.readFile(file));
        }
      },
    },
  },
} satisfies RuleSet;
