/// <reference path="../rules.d.ts" />

// FE-003 — Localization. One Discipline so far.
//
// `href-via-localize-path` — every JSX `href` under src/ is built by
// `localizePath`, so no link can carry a hand-written locale prefix or point at
// an `/en` route (FE-003 §1), or is an external link: a string literal
// `https://...`, or `externalHref(...)` for a URL held in data, on a tag that
// also carries target="_blank" and rel with noopener and noreferrer (FE-003 §2). Matched
// textually over whole files rather than per line, so an attribute value
// wrapped onto the next line is still seen. Runs at error (GEN-001 §7).
// Self-contained by design: archgate forbids imports between rules files.
const TSX_GLOB = 'src/**/*.tsx';

// `href=` as an attribute name; `hrefLang=` never matches because the name
// must end at `href`.
const HREF_RE = /\bhref\s*=\s*/g;
const LOCALIZED_VALUE_RE = /^\{\s*localizePath\(/;
const EXTERNAL_VALUE_RE = /^(?:(["'])https:\/\/[^"']*\1|\{\s*(?:(["'])https:\/\/[^"']*\2|externalHref\())/;
const TARGET_RE = /\btarget\s*=\s*(?:"_blank"|\{\s*['"]_blank['"]\s*\})/;
const REL_RE = /\brel\s*=\s*(["'{][^>]*)/;

// The opening tag an href sits in: back to its `<`, forward to the first `>`
// that does not close an arrow `=>`.
function tagAround(source: string, index: number): string {
  const start = source.lastIndexOf('<', index);
  const rest = source.slice(index);
  const end = rest.search(/(?<!=)>/);
  return source.slice(start < 0 ? index : start, end < 0 ? source.length : index + end);
}

function opensSafely(tag: string): boolean {
  if (!TARGET_RE.test(tag)) return false;
  const rel = REL_RE.exec(tag)?.[1] ?? '';
  const words = rel.split(/["'}]/)[1] ?? rel;
  return /\bnoopener\b/.test(words) && /\bnoreferrer\b/.test(words);
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

export default {
  rules: {
    'href-via-localize-path': {
      description:
        'Every JSX href under src/ is {localizePath(...)}, or an https:// literal / externalHref(...) on a tag with target="_blank" and rel="noopener noreferrer".',
      severity: 'error',
      async check(ctx) {
        for (const file of await ctx.glob(TSX_GLOB)) {
          const source = await ctx.readFile(file);
          for (const match of source.matchAll(HREF_RE)) {
            const value = source.slice(match.index + match[0].length);
            if (LOCALIZED_VALUE_RE.test(value)) continue;
            if (EXTERNAL_VALUE_RE.test(value)) {
              if (opensSafely(tagAround(source, match.index))) continue;
              ctx.report.violation({
                message:
                  'External link must carry target="_blank" and rel="noopener noreferrer" (FE-003 [href-via-localize-path]).',
                file,
                line: lineAt(source, match.index),
              });
              continue;
            }
            ctx.report.violation({
              message:
                'href is neither localizePath(...) nor an https:// literal or externalHref(...) — write href={localizePath(<logical path>, locale)}; to switch locale, pass stripLocale(pathname) as the path (FE-003 [href-via-localize-path]).',
              file,
              line: lineAt(source, match.index),
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
