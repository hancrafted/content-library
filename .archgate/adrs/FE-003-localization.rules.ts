/// <reference path="../rules.d.ts" />

// FE-003 — Localization.
//
// `href-via-localize-path` (§2) — every JSX `href` under src/ is
// `localizePath(...)`, or an external link: an `https://` literal or
// `externalHref(...)` on a tag carrying target="_blank" and rel with noopener
// and noreferrer. An `href` spread in (`{...{ href: x }}`) is refused, since
// it would hide the value from this check. Matched textually over whole files,
// so a value wrapped onto the next line is still seen.
// Self-contained by design: archgate forbids imports between rules files.
const TSX_GLOB = 'src/**/*.tsx';

// `href=` as an attribute name; `hrefLang=` never matches because the name
// must end at `href`.
const HREF_RE = /\bhref\s*=\s*/g;
// An object spread whose first key is `href`, as in `{...{ href: x }}`.
const SPREAD_HREF_RE = /\.\.\.\s*\{\s*['"]?href['"]?\s*:/g;
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
          for (const match of source.matchAll(SPREAD_HREF_RE)) {
            ctx.report.violation({
              message:
                'href is spread in, which hides it from this check — write it as a plain href= attribute (FE-003 [href-via-localize-path]).',
              file,
              line: lineAt(source, match.index),
            });
          }
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
