/// <reference path="../rules.d.ts" />

// FE-008 — Page Metadata. The parts of the decision that sit in one route file's
// text: a page exports its metadata through pageMetadata(), and a layout carries
// no page-level field a page would silently inherit. Canonical/hreflang
// correctness lives in tests/post-build/page-metadata.build.test.ts, over the
// built HTML. Matched textually; runs at error (GEN-001 §7). Self-contained by
// design: archgate forbids imports between rules files.
const APP_GLOB = 'src/app/**/*';
const PAGE_FILE_RE = /^src\/app\/(.+\/)?page\.(tsx|ts|jsx|js)$/;
const LAYOUT_FILE_RE = /^src\/app\/(.+\/)?layout\.(tsx|ts|jsx|js)$/;

const METADATA_EXPORT_RE =
  /export\s+(?:const\s+(?:metadata|generateMetadata)\b|(?:async\s+)?function\s+generateMetadata\b)/;
const PAGE_HELPER_RE = /\bpageMetadata\s*\(/;
const PAGE_LEVEL_FIELD_RE = /\b(alternates|canonical|description|pageMetadata)\b/g;

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

export default {
  rules: {
    'page-exports-metadata': {
      description:
        'Every src/app/**/page file exports metadata or generateMetadata, built by pageMetadata() so title, description, canonical and hreflang come from one place.',
      severity: 'error',
      async check(ctx) {
        for (const file of await ctx.glob(APP_GLOB)) {
          if (!PAGE_FILE_RE.test(file)) continue;
          const source = await ctx.readFile(file);
          if (!METADATA_EXPORT_RE.test(source)) {
            ctx.report.violation({
              message:
                "Page exports no metadata — add export const metadata = pageMetadata('<page>', DEFAULT_LOCALE), or a generateMetadata that returns pageMetadata(...) (FE-008 [page-exports-metadata]).",
              file,
            });
          } else if (!PAGE_HELPER_RE.test(source)) {
            ctx.report.violation({
              message:
                'Page metadata is built by hand — return pageMetadata(<page>, locale) from @/lib/page-metadata.pure so copy comes from the Translation files and alternates from localizePath (FE-008 [page-exports-metadata]).',
              file,
            });
          }
        }
      },
    },
    'layout-holds-site-metadata-only': {
      description:
        'No src/app/**/layout file names alternates, canonical, description or pageMetadata — page-level fields set on a layout are inherited by every page that omits them.',
      severity: 'error',
      async check(ctx) {
        for (const file of await ctx.glob(APP_GLOB)) {
          if (!LAYOUT_FILE_RE.test(file)) continue;
          const source = await ctx.readFile(file);
          for (const match of source.matchAll(PAGE_LEVEL_FIELD_RE)) {
            ctx.report.violation({
              message: `Layout names '${match[1]}', a page-level field every child page would inherit — keep layouts to siteMetadata() and move it to the page (FE-008 [layout-holds-site-metadata-only]).`,
              file,
              line: lineAt(source, match.index),
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
