// @ts-check
// FE-006 (boundary) and FE-007 (layering): import edges no single file can see.
// Read the dependency count on the summary line, never the checkmark: without
// `tsPreCompilationDeps` every `import type` is erased and the rules below
// cruise a thinner graph while still reporting success.

// What an Episode file may reach: the Slide master (which holds the Episode
// record, `slide-master/episode-record.ts`), its own Episode folder and src/lib.
// Legacy: the two `episode-page/*.pure.ts` modules are reached only by Episodes
// not yet written as Slide files; this exemption goes with the last of them.
const EPISODE_REACH = [
  '^src/components/(slide-master|episodes)/',
  '^src/lib/',
  '^src/components/episode-page/(episode-page-container|slide-context)\\.pure\\.ts$',
];

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'hooks-reached-only-from-client',
      severity: 'error',
      comment:
        'A hook runs only in the browser. Reach src/hooks/** from a *.client.tsx leaf, another hook, or a test — never from a Server Component (FE-006).',
      from: { pathNot: ['\\.client\\.tsx$', '^src/hooks/', '\\.test\\.tsx?$'] },
      to: { path: '^src/hooks/' },
    },
    {
      name: 'prefs-storage-reached-only-from-client',
      severity: 'error',
      comment:
        'src/lib/prefs-storage.ts touches window.localStorage. Reach it from a hook, a *.client.tsx leaf or a test — a Server Component would read empty prefs at build time and render silently wrong (FE-006). Named by path: no classifier marks a browser-API module, so a second one needs this rule widened by hand.',
      from: { pathNot: ['\\.client\\.tsx$', '^src/hooks/', '\\.test\\.tsx?$'] },
      to: { path: '^src/lib/prefs-storage\\.ts$' },
    },
    {
      name: 'client-never-imports-app',
      severity: 'error',
      comment:
        'A *.client.tsx leaf MUST NOT import from src/app/**; route code would ride into the client bundle and the dependency would run against the tree (FE-006).',
      from: { path: '\\.client\\.tsx$' },
      to: { path: '^src/app/' },
    },
    {
      name: 'toc-reached-only-from-container',
      severity: 'error',
      comment:
        'Inside Episode code, the table of contents is reached only through EpisodePageContainer, which derives its entries from the same anchors the slides carry. Other page kinds may still use it (FE-002).',
      from: {
        path: '^src/components/(episode-page|slide-master|episodes)/',
        pathNot: '^src/components/episode-page/episode-page-container\\.(tsx|pure\\.ts)$',
      },
      to: { path: '^src/components/table-of-contents/' },
    },
    {
      name: 'context-drawer-reached-only-from-container',
      severity: 'error',
      comment:
        'The Context drawer is reached only through EpisodePageContainer, which derives its entries from the same anchors the slides carry; no other module imports it (FE-010 §5).',
      from: {
        pathNot: [
          '^src/components/episode-page/(episode-page-container\\.tsx|context-drawer-input(\\.pure)?\\.ts)$',
          '^src/components/context-drawer/',
        ],
      },
      to: { path: '^src/components/context-drawer/' },
    },
    {
      name: 'context-drawer-takes-input-only',
      severity: 'error',
      comment:
        'The Context drawer knows nothing of Episodes: it renders from one ContextDrawerInput and observes the ids it is given. Its components, hooks and lib files MUST NOT import Episode, table-of-contents, route or next-intl code (FE-010 §8). The one adapter that builds the input lives under src/components/episode-page/.',
      from: {
        path: '^src/(components/context-drawer/|hooks/use-(context-|reading-line)|lib/(context-drawer|context-link|roving-focus|reading-line)\\.pure\\.ts$)',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: [
          '^src/components/(episode-page|slide-master|episodes|table-of-contents)/',
          '^src/hooks/use-table-of-contents',
          '^src/lib/(episode|routes|table-of-contents)',
          '(^|/)node_modules/next-intl/',
        ],
      },
    },
    {
      name: 'episodes-reach-only-slide-parts',
      severity: 'error',
      comment:
        'An Episode page file composes the Slide master, Slide layouts and the Episode record, plus src/lib helpers — never the table of contents, page shells or routes (FE-002).',
      from: { path: '^src/components/episodes/', pathNot: ['\\.test\\.ts$', '^src/components/episodes/[^/]+/client/'] },
      to: { pathNot: [...EPISODE_REACH, 'node_modules'] },
    },
    {
      name: 'episode-client-reach-only-hooks-and-lib',
      severity: 'error',
      comment:
        'A one-Episode widget under episodes/<ep>/client/ is the only place an Episode runs in the browser. It reaches its own client/ folder, src/lib helpers and src/hooks — never the Slide master, page shells or other components (FE-002, FE-006).',
      from: { path: '^src/components/episodes/[^/]+/client/', pathNot: '\\.test\\.ts$' },
      to: { pathNot: ['^src/components/episodes/[^/]+/client/', '^src/(lib|hooks)/', 'node_modules'] },
    },
    {
      name: 'episode-tests-reach-only-slide-parts',
      severity: 'error',
      comment:
        'An Episode test reaches what an Episode file does, plus Node builtins for reading in-test file fixtures such as published-anchors.json (ARCH-003 §4.2).',
      from: { path: '^src/components/episodes/.+\\.test\\.ts$' },
      to: {
        pathNot: [...EPISODE_REACH, 'node_modules'],
        dependencyTypesNot: ['core'],
      },
    },
    {
      name: 'episodes-never-render-the-shell',
      severity: 'error',
      comment:
        'The Title slide and the container are rendered once, by the EpisodePage page component. An Episode page file imports only the Episode record types from episode-page-container.pure.ts (FE-002).',
      from: { path: '^src/components/episodes/' },
      to: { path: '^src/components/episode-page/(title-slide|episode-page-container)\\.tsx$' },
    },

    // FE-007: layering. Tiers run app → components → hooks → lib; an edge may
    // skip a tier downward, never point upward. Boundary rules above (FE-006)
    // and the layering rules below can both fire on one edge.
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'No import cycle anywhere under src/; a cycle makes the tier order meaningless (FE-007).',
      from: { path: '^src/' },
      to: { circular: true },
    },
    {
      name: 'lib-imports-no-react',
      severity: 'error',
      comment:
        'src/lib/** imports no React — not runtime, not types — so every lib module stays a plain module a vitest test imports without a DOM (FE-007).',
      from: { path: '^src/lib/' },
      to: { path: '(^|/)node_modules/(@types/)?(react|react-dom)/' },
    },
    {
      name: 'lib-tsx-never-imported',
      severity: 'error',
      comment: 'JSX needs a .tsx file; src/lib/** holds none, so nothing may import a .tsx module from it (FE-007).',
      from: {},
      to: { path: '^src/lib/.+\\.tsx$' },
    },
    {
      name: 'lib-imports-no-upper-tier',
      severity: 'error',
      comment: 'src/lib/** is the bottom tier: it MUST NOT import src/app, src/components or src/hooks (FE-007).',
      from: { path: '^src/lib/' },
      to: { path: '^src/(app|components|hooks)/' },
    },
    {
      name: 'hooks-import-no-upper-tier',
      severity: 'error',
      comment: 'src/hooks/** sits above lib only: it MUST NOT import src/app or src/components (FE-007).',
      from: { path: '^src/hooks/' },
      to: { path: '^src/(app|components)/' },
    },
    // Relies on options.exclude '\.css$': site-shell.tsx imports @/app/globals.css, so dropping that exclusion fires this rule.
    {
      name: 'components-never-import-app',
      severity: 'error',
      comment: 'src/components/** sits below the routes: it MUST NOT import src/app/** (FE-007).',
      from: { path: '^src/components/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'pages-reached-only-from-app',
      severity: 'error',
      comment:
        'src/components/pages/** is the top sub-tier of components: only a route under src/app/** (or a test) imports it, never another component or a page (FE-007).',
      from: { pathNot: ['^src/app/', '\\.test\\.tsx?$'] },
      to: { path: '^src/components/pages/' },
    },
    {
      name: 'site-shell-reached-only-from-root-layouts',
      severity: 'error',
      comment:
        'SiteShell renders <html>; only the two root layouts (or a test) import it. A nested layout or page doing so would nest a second <html> (FE-007).',
      from: { pathNot: ['^src/app/(\\(en\\)|\\[locale\\])/layout\\.tsx$', '\\.test\\.tsx?$'] },
      to: { path: '^src/components/site-shell\\.tsx$' },
    },
    {
      name: 'route-reaches-components-only-via-roots',
      severity: 'error',
      comment:
        'A route composes; it does not lay out. src/app/** reaches src/components/** only through a page component under src/components/pages/ or SiteShell (FE-007).',
      from: { path: '^src/app/' },
      to: { path: '^src/components/', pathNot: '^src/components/(pages/|site-shell\\.tsx$)' },
    },
  ],
  required: [
    {
      name: 'page-composes-a-page-component',
      severity: 'error',
      comment: 'Every src/app/**/page.tsx renders a component from src/components/pages/ (FE-007).',
      module: { path: '^src/app/(.+/)?page\\.tsx$' },
      to: { path: '^src/components/pages/' },
    },
    {
      name: 'root-layout-composes-site-shell',
      severity: 'error',
      comment: 'Each root layout — the one rendering <html> — renders SiteShell (FE-007).',
      module: { path: '^src/app/(\\(en\\)|\\[locale\\])/layout\\.tsx$' },
      to: { path: '^src/components/site-shell\\.tsx$' },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.css$' },
  },
};
