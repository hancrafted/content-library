// @ts-check
// FE-006 (boundary) and FE-007 (layering): import edges no single file can see.
// Read the dependency count on the summary line, never the checkmark: without
// `tsPreCompilationDeps` every `import type` is erased and the rules below
// cruise a thinner graph while still reporting success.

// What an Episode file may reach: the Slide master (which holds the Episode
// record, `slide-master/slide.ts`), slide-shared (parts several Slides
// of any Episode share), explorable-explanations (the Explorable explanations Slides show), the Episode folders,
// the Slide pool (a Slide two Episodes reuse, listed by reference: design-ADR 0016) and src/lib.
const EPISODE_REACH = [
  '^src/components/(slide-master|slide-shared|explorable-explanations|episodes|slide-pool)/',
  '^src/lib/',
];

// A self-contained Slide is one folder, `episodes/<ep>/slides/<slide>/` (FE-002, FE-007 §5). The two capture
// groups name the Episode and the Slide, so a rule's `to` can say "this same folder" as `$1`/`$2`.
const SLIDE_FOLDER = '^src/components/episodes/([^/]+)/slides/([^/]+)/';
const OWN_SLIDE_FOLDER = '^src/components/episodes/$1/slides/$2/';
// A pool Slide is the same folder moved into the flat Slide pool on first reuse (design-ADR 0016, Slide reuse rule 1);
// it obeys the same boundary. The capture group names the Slide.
const POOL_SLIDE = '^src/components/slide-pool/([^/]+)/';
const OWN_POOL_SLIDE = '^src/components/slide-pool/$1/';
// The global shared locations a Slide may import: the Slide master, slide-shared, the UI kit, hooks and lib.
const SLIDE_SHARED_REACH = [
  '^src/components/(slide-master|slide-shared|explorable-explanations|ui)/',
  '^src/(hooks|lib)/',
];

// The primitives slide-shared parts share, one subfolder each: a leaf (FE-007 §5.2.1).
const CORE_COMPONENTS = '^src/components/slide-shared/core-components/';

// A slide-shared part's client leaf, inside its part folder; the capture group names the part (FE-007 §5.2).
const SLIDE_SHARED_CLIENT = '^src/components/slide-shared/([^/]+)/.+\\.client\\.tsx$';

// An Explorable explanation lives in its own folder apart from plain shared parts (design-ADR 0016 decision 6);
// its client leaf sits in that folder, the capture group names it.
const EXPLANATIONS = '^src/components/explorable-explanations/';
const EXPLANATION_CLIENT = '^src/components/explorable-explanations/([^/]+)/.+\\.client\\.tsx$';

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
      name: 'client-never-reaches-node-fs',
      severity: 'error',
      comment:
        'The content store and the files it reads (content-store.ts, evidence-files.ts, slide-folders.ts) use node:fs and run only at build time, on the server. No *.client.tsx leaf may reach them, directly or through any chain of imports: node:fs would ride into the client bundle (FE-006). Named by path, as prefs-storage is: a new node:fs reader needs this rule widened by hand.',
      from: { path: '\\.client\\.tsx$' },
      to: {
        path: '^src/(components/episodes/content-store|lib/(evidence-files|slide-folders))\\.ts$',
        reachable: true,
      },
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
      from: {
        path: '^src/components/episodes/',
        pathNot: ['\\.test\\.ts$', SLIDE_FOLDER],
      },
      to: { pathNot: [...EPISODE_REACH, 'node_modules'] },
    },
    {
      name: 'slide-folder-reaches-only-own-and-shared',
      severity: 'error',
      comment:
        'A Slide folder (episodes/<ep>/slides/<slide>/) imports only its own files and the global shared locations: src/components/slide-master/, src/components/slide-shared/, src/components/explorable-explanations/, src/components/ui/, src/hooks/ and src/lib/. Never another Slide, the Episode file, or anything else Episode-local; a part two Slides share moves to src/components/slide-shared/ (FE-007).',
      from: { path: SLIDE_FOLDER },
      to: { pathNot: [OWN_SLIDE_FOLDER, ...SLIDE_SHARED_REACH, 'node_modules'], dependencyTypesNot: ['core'] },
    },
    {
      name: 'slide-client-reaches-only-hooks-and-lib',
      severity: 'error',
      comment:
        "A Slide's *.client.tsx widget runs in the browser. It reaches its own Slide folder, src/hooks/ and src/lib/ only — never the Slide master, slide-shared, the UI kit or other components (FE-002, FE-006).",
      from: { path: `${SLIDE_FOLDER}.+\\.client\\.tsx$` },
      to: { pathNot: [OWN_SLIDE_FOLDER, '^src/(hooks|lib)/', 'node_modules'] },
    },
    {
      name: 'pool-slide-reaches-only-own-and-shared',
      severity: 'error',
      comment:
        'A pool Slide (slide-pool/<slide>/) is a Slide folder two Episodes reuse, and obeys the same boundary: it imports only its own files and src/components/slide-master/, slide-shared/, explorable-explanations/, ui/, src/hooks/ and src/lib/. Never another Slide, an Episode, or the pool itself (FE-007 §5, design-ADR 0016).',
      from: { path: POOL_SLIDE },
      to: { pathNot: [OWN_POOL_SLIDE, ...SLIDE_SHARED_REACH, 'node_modules'], dependencyTypesNot: ['core'] },
    },
    {
      name: 'pool-slide-client-reaches-only-hooks-and-lib',
      severity: 'error',
      comment:
        "A pool Slide's *.client.tsx widget runs in the browser. It reaches its own Slide folder, src/hooks/ and src/lib/ only, as any Slide's widget (FE-006 §5, design-ADR 0016).",
      from: { path: `${POOL_SLIDE}.+\\.client\\.tsx$` },
      to: { pathNot: [OWN_POOL_SLIDE, '^src/(hooks|lib)/', 'node_modules'] },
    },
    {
      name: 'slide-pool-reached-only-from-episodes',
      severity: 'error',
      comment:
        'A pool Slide is listed by reference from an Episode file (its record or a sections/<section>.ts), as an Episode lists its own Slides. Nothing else imports it (FE-004, design-ADR 0016).',
      from: { pathNot: ['^src/components/(episodes|slide-pool)/', '\\.test\\.tsx?$'] },
      to: { path: '^src/components/slide-pool/' },
    },
    {
      name: 'slide-shared-reaches-only-ui-and-lib',
      severity: 'error',
      comment:
        'src/components/slide-shared/ holds parts several Slides of any Episode share. A part takes serializable props: its server files reach only other slide-shared parts, the UI kit (src/components/ui/) and src/lib — never a Slide, an Episode, the Slide master or its kit, so a Slide copied into another Episode finds it unchanged (FE-002, FE-007 §5, epic #51).',
      from: { path: '^src/components/slide-shared/', pathNot: ['\\.test\\.ts$', SLIDE_SHARED_CLIENT] },
      to: { pathNot: ['^src/components/(slide-shared|ui)/', '^src/lib/', 'node_modules'] },
    },
    {
      name: 'slide-shared-client-reaches-only-own-part-hooks-and-lib',
      severity: 'error',
      comment:
        "A slide-shared part's *.client.tsx leaf runs in the browser. It sits in its part's folder (src/components/slide-shared/<part>/) and reaches only that folder, src/hooks/ and src/lib/ — never another part, the UI kit, a Slide or the Slide master. The one exception is core-components/, which any slide-shared part, client leaf included, may import (FE-006 §5, FE-007 §5.2).",
      from: { path: SLIDE_SHARED_CLIENT },
      to: { pathNot: ['^src/components/slide-shared/$1/', CORE_COMPONENTS, '^src/(hooks|lib)/', 'node_modules'] },
    },
    {
      name: 'explorable-explanation-reaches-shared-ui-and-lib',
      severity: 'error',
      comment:
        'src/components/explorable-explanations/ holds the Explorable explanations several Slides show. An explanation takes serializable props: its server files reach only other explanations, slide-shared parts, the UI kit (src/components/ui/) and src/lib — never a Slide, an Episode, the Slide master or its kit (FE-012, FE-007 §5, design-ADR 0016 decision 6).',
      from: { path: EXPLANATIONS, pathNot: ['\\.test\\.ts$', EXPLANATION_CLIENT] },
      to: { pathNot: ['^src/components/(explorable-explanations|slide-shared|ui)/', '^src/lib/', 'node_modules'] },
    },
    {
      name: 'explorable-explanation-client-reaches-only-own-folder-core-hooks-and-lib',
      severity: 'error',
      comment:
        "An Explorable explanation's *.client.tsx leaf runs in the browser. It sits in its explanation's folder (src/components/explorable-explanations/<name>/) and reaches only that folder, slide-shared/core-components/, src/hooks/ and src/lib/ — never another explanation, a plain slide-shared part, the UI kit, a Slide or the Slide master (FE-006 §5, FE-007 §5.2).",
      from: { path: EXPLANATION_CLIENT },
      to: {
        pathNot: ['^src/components/explorable-explanations/$1/', CORE_COMPONENTS, '^src/(hooks|lib)/', 'node_modules'],
      },
    },
    {
      name: 'core-components-are-a-leaf',
      severity: 'error',
      comment:
        'src/components/slide-shared/core-components/ holds the primitives every slide-shared part shares. It is a leaf: its files import only core-components/, src/hooks/ and src/lib/ — never another slide-shared part, the UI kit, a Slide or the Slide master (FE-007 §5.2).',
      from: { path: CORE_COMPONENTS, pathNot: '\\.test\\.tsx?$' },
      to: { pathNot: [CORE_COMPONENTS, '^src/(hooks|lib)/', 'node_modules'] },
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
        'The Title slide and the container are rendered once, by the EpisodePage page component. An Episode page file never imports either (FE-002).',
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
