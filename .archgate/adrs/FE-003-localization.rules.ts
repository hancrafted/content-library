/// <reference path="../rules.d.ts" />

// FE-003 — Localization. One Discipline so far.
//
// `href-via-localize-path` — every JSX `href` under src/ is built by
// `localizePath`, so no link can carry a hand-written locale prefix or point at
// an `/en` route (FE-003 §1). Deliberately strict: an external link will trip
// it too, and that day the Discipline gets widened in prose first. Matched
// textually over whole files rather than per line, so an attribute value
// wrapped onto the next line is still seen. Runs at error (GEN-001 §7).
// Self-contained by design: archgate forbids imports between rules files.
const TSX_GLOB = 'src/**/*.tsx';

// `href=` as an attribute name; `hrefLang=` never matches because the name
// must end at `href`.
const HREF_RE = /\bhref\s*=\s*/g;
const LOCALIZED_VALUE_RE = /^\{\s*localizePath\(/;

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

export default {
  rules: {
    'href-via-localize-path': {
      description:
        'Every JSX href under src/ is the expression {localizePath(...)}, so every link is built from a locale-neutral logical path in the current locale.',
      severity: 'error',
      async check(ctx) {
        for (const file of await ctx.glob(TSX_GLOB)) {
          const source = await ctx.readFile(file);
          for (const match of source.matchAll(HREF_RE)) {
            const value = source.slice(match.index + match[0].length);
            if (LOCALIZED_VALUE_RE.test(value)) continue;
            ctx.report.violation({
              message:
                'href is not built by localizePath — write href={localizePath(<logical path>, locale)}; to switch locale, pass stripLocale(pathname) as the path (FE-003 [href-via-localize-path]).',
              file,
              line: lineAt(source, match.index),
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
