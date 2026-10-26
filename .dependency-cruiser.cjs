// @ts-check
// FE-006 (boundary) and FE-007 (layering): import edges no single file can see.
// Read the dependency count on the summary line, never the checkmark: without
// `tsPreCompilationDeps` every `import type` is erased and the rules below
// cruise a thinner graph while still reporting success.

// The Episodes product area keeps content apart from code: an Episode's folder, `<slug>/`, an Event's copies under
// `by-event/`, the Slide pool and the tooling pages, beside the area's tier folders `components/`, `lib/` and `hooks/`.
// EPISODE_CONTENT is everything but the tier folders.
const EPISODE_CONTENT = '^src/episodes/(?!(components|lib|hooks)/)';
// The Episodes area's tier folders, each the tier its name says (FE-007): components, browser hooks, plain logic.
const EPISODE_HOOKS = '^src/episodes/hooks/';
// The composition registries in the area's lib/: they import every Episode's and tooling page's record, so they sit
// above the Episodes they list and the lib rules below leave them out.
const COMPOSITION_REGISTRY = '^src/episodes/lib/(registry|tooling-pages|episode-registry\\.generated)\\.ts$';
// The tests that run over every composed Episode and tooling page through those registries, rendering Slides.
const REGISTRY_TESTS =
  '^src/episodes/lib/(placement-markers|published-anchors|registry|slide-dom-ids|slide-folders|tooling-pages)\\.test\\.ts$';
// Plain logic, no React: src/lib/ and the Episodes area's lib/.
const LIB = '^src/(lib|episodes/lib)/';
// Browser hooks: src/hooks/ and the Episodes area's hooks/.
const HOOKS = '^src/(hooks|episodes/hooks)/';

// What an Episode file may reach: the Slide master (which holds the Episode
// record, `slide-master/slide.ts`), slide-shared (parts several Slides
// of any Episode share), the Explorable explanations product area (the visuals Slides show), the Episode folders and
// lib.
const EPISODE_REACH = [
  '^src/episodes/components/(slide-master|slide-shared)/',
  EPISODE_CONTENT,
  '^src/explorable-explanations/',
  LIB,
];

// A self-contained Slide is one folder, `episodes/<ep>/slides/<slide>/`, `episodes/by-event/<event>/<ep>/slides/<slide>/`
// in an Event's copy, `episodes/tooling/<page>/slides/<slide>/` on a tooling page, or `episodes/slide-pool/<slide>/` in
// the Slide pool (FE-002, FE-004 §3, FE-007 §5). The two capture groups name the folder that holds the Slide and the
// Slide, so a rule's `to` can say "this same folder" as `$1/$2`.
const SLIDE_FOLDER =
  '^src/episodes/((?:by-event/[^/]+|tooling)/[^/]+/slides|(?!components/|lib/|hooks/)[^/]+/slides|slide-pool)/([^/]+)/';
const OWN_SLIDE_FOLDER = '^src/episodes/$1/$2/';
// The Slide pool: content Slides several Episodes compose (FE-004 §3).
const SLIDE_POOL = '^src/episodes/slide-pool/';
// A Section file, `<ep>/sections/<section-slug>.ts`, named after its section slide; the second capture group names it.
const SECTION_FILE = '^src/episodes/((?:by-event/[^/]+|tooling)/[^/]+|[^/]+)/sections/([^/]+)\\.ts$';
// The global shared locations a Slide may import: the Slide master, slide-shared, the Explorable explanations, the UI
// kit, hooks and lib.
const SLIDE_SHARED_REACH = [
  '^src/episodes/components/(slide-master|slide-shared)/',
  '^src/components/ui/',
  '^src/explorable-explanations/',
  HOOKS,
  LIB,
];

// The primitives slide-shared parts share, one subfolder each: a leaf (FE-007 §5.2.1).
// An Episode's metadata file, an Event's copy's under `by-event/<event>/`: a record the content store loads (FE-013).
const EPISODE_METADATA =
  '^src/episodes/(by-event/[^/]+/[^/]+|(?!components/|lib/|hooks/|tooling/)[^/]+)/episode-metadata\\.ts$';
// The store's schemas: a leaf every tier may import record types from (FE-007 §2.5).
const STORE_SCHEMAS = '^src/content-store/schemas/';

const CORE_COMPONENTS = '^src/episodes/components/slide-shared/core-components/';

// A slide-shared part's client leaf, inside its part folder; the capture group names the part (FE-007 §5.2).
const SLIDE_SHARED_CLIENT = '^src/episodes/components/slide-shared/([^/]+)/.+\\.client\\.tsx$';

// An Explorable explanation lives in its own folder of the Explorable explanations product area, apart from plain
// shared parts (design-ADR 0016 decision 6); its client leaf sits in that folder, the capture group names it.
const EXPLANATIONS = '^src/explorable-explanations/';
const EXPLANATION_CLIENT = '^src/explorable-explanations/([^/]+)/.+\\.client\\.tsx$';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'hooks-reached-only-from-client',
      severity: 'error',
      comment:
        'A hook runs only in the browser. Reach src/hooks/** or src/episodes/hooks/** from a *.client.tsx leaf, another hook, or a test — never from a Server Component (FE-006).',
      from: { pathNot: ['\\.client\\.tsx$', HOOKS, '\\.test\\.tsx?$'] },
      to: { path: HOOKS },
    },
    {
      name: 'prefs-storage-reached-only-from-client',
      severity: 'error',
      comment:
        'src/lib/prefs-storage.ts touches window.localStorage. Reach it from a hook, a *.client.tsx leaf or a test — a Server Component would read empty prefs at build time and render silently wrong (FE-006). Named by path: no classifier marks a browser-API module, so a second one needs this rule widened by hand.',
      from: { pathNot: ['\\.client\\.tsx$', HOOKS, '\\.test\\.tsx?$'] },
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
        path: '^src/episodes/',
        pathNot: '^src/episodes/components/episode-page/episode-page-container\\.(tsx|pure\\.ts)$',
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
          '^src/episodes/components/episode-page/(episode-page-container\\.tsx|context-drawer-input(\\.pure)?\\.ts)$',
          '^src/components/context-drawer/',
        ],
      },
      to: { path: '^src/components/context-drawer/' },
    },
    {
      name: 'context-drawer-takes-input-only',
      severity: 'error',
      comment:
        'The Context drawer knows nothing of Episodes: it renders from one ContextDrawerInput and observes the ids it is given. Its components, hooks and lib files MUST NOT import Episode, table-of-contents, route or next-intl code (FE-010 §8). The one adapter that builds the input lives under src/episodes/components/episode-page/.',
      from: {
        path: '^src/(components/context-drawer/|hooks/use-(context-|reading-line)|lib/(context-drawer|context-link|roving-focus|reading-line)\\.pure\\.ts$)',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: [
          '^src/episodes/',
          '^src/components/table-of-contents/',
          '^src/hooks/use-table-of-contents',
          '^src/lib/(routes|table-of-contents)',
          '(^|/)node_modules/next-intl/',
        ],
      },
    },
    {
      name: 'episodes-reach-only-slide-parts',
      severity: 'error',
      comment:
        'An Episode page file composes the Slide master, Slide layouts and the Episode record, plus lib helpers — never the table of contents, page shells or routes (FE-002).',
      from: {
        path: EPISODE_CONTENT,
        pathNot: ['\\.test\\.ts$', SLIDE_FOLDER, EPISODE_METADATA],
      },
      to: { pathNot: [...EPISODE_REACH, 'node_modules'] },
    },
    {
      name: 'slide-folder-reaches-only-own-and-shared',
      severity: 'error',
      comment:
        'A Slide folder (episodes/<ep>/slides/<slide>/, or a pool Slide, episodes/slide-pool/<slide>/) imports only its own files and the global shared locations: src/episodes/components/slide-master/, src/episodes/components/slide-shared/, src/explorable-explanations/, src/components/ui/, src/hooks/, src/lib/, src/episodes/hooks/ and src/episodes/lib/. Never another Slide, a pool Slide included, the Episode file, or anything else Episode-local; a part two Slides share moves to src/episodes/components/slide-shared/ (FE-007).',
      from: { path: SLIDE_FOLDER },
      to: { pathNot: [OWN_SLIDE_FOLDER, ...SLIDE_SHARED_REACH, 'node_modules'], dependencyTypesNot: ['core'] },
    },
    {
      name: 'slide-pool-reached-only-from-sections',
      severity: 'error',
      comment:
        'A pool Slide (src/episodes/slide-pool/<slide>/) is a content Slide several Episodes compose: only a Section file, <ep>/sections/<section-slug>.ts, imports it. Never the Episode file, so a pool Slide is never a Title slide, and never another Slide (FE-004).',
      from: { pathNot: [SECTION_FILE, SLIDE_POOL] },
      to: { path: SLIDE_POOL },
    },
    {
      name: 'section-slide-never-from-pool',
      severity: 'error',
      comment:
        "A Section file is named after its section slide (sections/<section-slug>.ts). That Slide stays the Episode's own, in its slides/ folder: only content Slides enter the Slide pool, so a Section never imports src/episodes/slide-pool/<section-slug>/ (FE-004).",
      from: { path: SECTION_FILE },
      to: { path: '^src/episodes/slide-pool/$2/' },
    },
    {
      name: 'section-reaches-pool-by-alias',
      severity: 'error',
      comment:
        'A Section imports a pool Slide through the alias path, @/episodes/slide-pool/<slide>/slide, never a relative path, so an Event copy under by-event/ imports it the same way at any depth (FE-004).',
      from: { path: SECTION_FILE },
      to: { path: SLIDE_POOL, dependencyTypesNot: ['aliased-tsconfig'] },
    },
    {
      name: 'slide-client-reaches-only-hooks-and-lib',
      severity: 'error',
      comment:
        "A Slide's *.client.tsx widget runs in the browser. It reaches its own Slide folder, the hooks and lib folders (src/ and src/episodes/) only — never the Slide master, slide-shared, the UI kit or other components (FE-002, FE-006).",
      from: { path: `${SLIDE_FOLDER}.+\\.client\\.tsx$` },
      to: { pathNot: [OWN_SLIDE_FOLDER, HOOKS, LIB, 'node_modules'] },
    },
    {
      name: 'slide-shared-reaches-only-ui-and-lib',
      severity: 'error',
      comment:
        'src/episodes/components/slide-shared/ holds parts several Slides of any Episode share. A part takes serializable props: its server files reach only other slide-shared parts, the UI kit (src/components/ui/) and lib — never a Slide, an Episode, the Slide master or its kit, so a Slide copied into another Episode finds it unchanged (FE-002, FE-007 §5, epic #51).',
      from: { path: '^src/episodes/components/slide-shared/', pathNot: ['\\.test\\.ts$', SLIDE_SHARED_CLIENT] },
      to: { pathNot: ['^src/episodes/components/slide-shared/', '^src/components/ui/', LIB, 'node_modules'] },
    },
    {
      name: 'slide-shared-client-reaches-only-own-part-hooks-and-lib',
      severity: 'error',
      comment:
        "A slide-shared part's *.client.tsx leaf runs in the browser. It sits in its part's folder (src/episodes/components/slide-shared/<part>/) and reaches only that folder, src/hooks/ and src/lib/ — never another part, the UI kit, a Slide or the Slide master. The one exception is core-components/, which any slide-shared part, client leaf included, may import (FE-006 §5, FE-007 §5.2).",
      from: { path: SLIDE_SHARED_CLIENT },
      to: { pathNot: ['^src/episodes/components/slide-shared/$1/', CORE_COMPONENTS, HOOKS, LIB, 'node_modules'] },
    },
    {
      name: 'explorable-explanation-reaches-shared-ui-and-lib',
      severity: 'error',
      comment:
        'src/explorable-explanations/ holds the Explorable explanations several Slides show. An explanation takes serializable props: its server files reach only other explanations, slide-shared parts, the UI kit (src/components/ui/) and src/lib — never a Slide, an Episode, the Slide master or its kit (FE-012, FE-007 §5, design-ADR 0016 decision 6).',
      from: { path: EXPLANATIONS, pathNot: ['\\.test\\.ts$', EXPLANATION_CLIENT] },
      to: {
        pathNot: [EXPLANATIONS, '^src/episodes/components/slide-shared/', '^src/components/ui/', LIB, 'node_modules'],
      },
    },
    {
      name: 'explorable-explanation-client-reaches-only-own-folder-core-hooks-and-lib',
      severity: 'error',
      comment:
        "An Explorable explanation's *.client.tsx leaf runs in the browser. It sits in its explanation's folder (src/explorable-explanations/<name>/) and reaches only that folder, slide-shared/core-components/, src/hooks/ and src/lib/ — never another explanation, a plain slide-shared part, the UI kit, a Slide or the Slide master (FE-006 §5, FE-007 §5.2).",
      from: { path: EXPLANATION_CLIENT },
      to: {
        pathNot: ['^src/explorable-explanations/$1/', CORE_COMPONENTS, HOOKS, LIB, 'node_modules'],
      },
    },
    {
      name: 'explorable-explanation-reached-only-from-slides-and-page-assembly',
      severity: 'error',
      comment:
        'src/explorable-explanations/ is a product area. A Slide folder showing an explanation is the one edge another product area may draw into it; otherwise only page assembly, another explanation or a test imports it, never a shared part, a hook, src/lib or the content store (FE-007, FE-012).',
      from: { pathNot: [SLIDE_FOLDER, EXPLANATIONS, '^src/page-assembly/', '\\.test\\.tsx?$'] },
      to: { path: EXPLANATIONS },
    },
    {
      name: 'core-components-are-a-leaf',
      severity: 'error',
      comment:
        'src/episodes/components/slide-shared/core-components/ holds the primitives every slide-shared part shares. It is a leaf: its files import only core-components/, src/hooks/ and src/lib/ — never another slide-shared part, the UI kit, a Slide or the Slide master (FE-007 §5.2).',
      from: { path: CORE_COMPONENTS, pathNot: '\\.test\\.tsx?$' },
      to: { pathNot: [CORE_COMPONENTS, HOOKS, LIB, 'node_modules'] },
    },
    {
      name: 'episode-tests-reach-only-slide-parts',
      severity: 'error',
      comment:
        "An Episode test reaches what an Episode file does, plus Node builtins for reading in-test file fixtures such as published-anchors.json (ARCH-003 §4.2), and the content store's entry and schemas, the one reader of an Episode's status and its type (FE-013).",
      from: { path: `${EPISODE_CONTENT}.+\\.test\\.ts$` },
      to: {
        pathNot: [...EPISODE_REACH, '^src/content-store/store\\.ts$', STORE_SCHEMAS, 'node_modules'],
        dependencyTypesNot: ['core'],
      },
    },
    {
      name: 'episodes-never-render-the-shell',
      severity: 'error',
      comment:
        'The Title slide and the container are rendered once, by the EpisodePage page component. An Episode page file never imports either (FE-002).',
      from: { path: EPISODE_CONTENT },
      to: { path: '^src/episodes/components/episode-page/(title-slide|episode-page-container)\\.tsx$' },
    },

    // FE-007: layering. Tiers run app → components → content-store → hooks → lib; an edge may
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
        'src/lib/** and src/episodes/lib/** import no React — not runtime, not types — so every lib module stays a plain module a vitest test imports without a DOM (FE-007).',
      from: { path: LIB, pathNot: REGISTRY_TESTS },
      to: { path: '(^|/)node_modules/(@types/)?(react|react-dom)/' },
    },
    {
      name: 'lib-tsx-never-imported',
      severity: 'error',
      comment:
        'JSX needs a .tsx file; src/lib/** and src/episodes/lib/** hold none, so nothing may import a .tsx module from them (FE-007).',
      from: {},
      to: { path: `${LIB}.+\\.tsx$` },
    },
    {
      name: 'lib-imports-no-upper-tier',
      severity: 'error',
      comment:
        "src/lib/** and src/episodes/lib/** are the bottom tier: they MUST NOT import src/app, page assembly, a component, the content store, a hook or an Episode's folder — except the store's schemas, a leaf every tier reads record types from. The composition registries in src/episodes/lib/ import every Episode's record and sit above it (FE-007).",
      from: { path: LIB, pathNot: [COMPOSITION_REGISTRY, REGISTRY_TESTS] },
      to: {
        path: ['^src/(app|page-assembly|components|content-store|hooks)/', '^src/episodes/(?!lib/)'],
        pathNot: STORE_SCHEMAS,
      },
    },
    {
      name: 'hooks-import-no-upper-tier',
      severity: 'error',
      comment:
        "src/hooks/** and src/episodes/hooks/** sit above lib only: they MUST NOT import src/app, page assembly, a component, the content store or an Episode's folder — except the store's schemas (FE-007).",
      from: { path: HOOKS },
      to: {
        path: ['^src/(app|page-assembly|components|content-store)/', '^src/episodes/(?!(lib|hooks)/)'],
        pathNot: STORE_SCHEMAS,
      },
    },
    // FE-013 and FE-007 §2.5: the content store is the one reader of records, and its own tier.
    {
      name: 'records-read-only-through-store',
      severity: 'error',
      comment:
        "Records are read only through src/content-store/store.ts: nothing else imports an Episode's episode-metadata.ts or src/content-store/{events,playlists}/** (FE-013).",
      from: {
        pathNot: ['^src/content-store/', '\\.test\\.tsx?$', EPISODE_METADATA],
      },
      to: { path: [EPISODE_METADATA, '^src/content-store/(events|playlists)/'] },
    },
    {
      name: 'store-entry-only',
      severity: 'error',
      comment:
        'Outside the content store, imports reach only its entry, src/content-store/store.ts, and its schemas for record types; refusals and records stay free to change behind it (FE-013).',
      from: { pathNot: ['^src/content-store/', '\\.test\\.tsx?$'] },
      to: { path: '^src/content-store/', pathNot: ['^src/content-store/store\\.ts$', STORE_SCHEMAS] },
    },
    {
      name: 'episode-metadata-reaches-only-schemas-and-lib',
      severity: 'error',
      comment:
        "An Episode's episode-metadata.ts is a record: it imports only src/content-store/schemas/**, src/lib/** and zod, so the store reading it closes no cycle (FE-007, FE-013).",
      from: { path: EPISODE_METADATA },
      to: { pathNot: ['^src/content-store/schemas/', '^src/lib/', '(^|/)node_modules/zod/'] },
    },
    {
      name: 'schemas-are-a-leaf',
      severity: 'error',
      comment:
        'src/content-store/schemas/** is a leaf every tier may import record types from: it imports only other schemas and zod, so lib reading it closes no upward edge (FE-007, FE-013).',
      from: { path: STORE_SCHEMAS },
      to: { pathNot: [STORE_SCHEMAS, '(^|/)node_modules/zod/'] },
    },
    {
      name: 'client-never-imports-content-store',
      severity: 'error',
      comment:
        'A *.client.tsx leaf MUST NOT import the content store at runtime — Zod and every record would ride into the client bundle. A type-only import is fine; a client leaf gets record values as props (FE-013).',
      from: { path: '\\.client\\.tsx$' },
      to: { path: '^src/content-store/', dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'content-store-tier',
      severity: 'error',
      comment:
        "src/content-store/** sits between components and hooks: it imports no React and nothing from src/app, page assembly, a component or the Episodes area except an Episode's episode-metadata.ts and the area's plain lib modules (the Episode id) (FE-007).",
      from: { path: '^src/content-store/' },
      to: {
        path: ['^src/(app|page-assembly|components|episodes)/', '(^|/)node_modules/(@types/)?(react|react-dom)/'],
        pathNot: [EPISODE_METADATA, '^src/episodes/lib/(?!registry|tooling-pages|episode-registry)[^/]+\\.ts$'],
      },
    },
    // Relies on options.exclude '\.css$': site-shell.tsx imports @/app/globals.css, so dropping that exclusion fires this rule.
    {
      name: 'components-never-import-app',
      severity: 'error',
      comment:
        'src/page-assembly/**, src/components/** and src/episodes/** sit below the routes: they MUST NOT import src/app/** (FE-007).',
      from: { path: '^src/(page-assembly|components|episodes)/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'page-assembly-reached-only-from-app',
      severity: 'error',
      comment:
        'src/page-assembly/** is the layer between the routes and everything below them: only a route under src/app/** (or a test) imports it from outside, never a component, hook, lib module or the content store (FE-007).',
      from: { pathNot: ['^src/app/', '^src/page-assembly/', '\\.test\\.tsx?$'] },
      to: { path: '^src/page-assembly/' },
    },
    {
      name: 'template-reaches-only-own-folder-and-lib',
      severity: 'error',
      comment:
        'Page assembly is flat: a template folder (src/page-assembly/<template>/) holds its single-use parts and imports only its own files and src/page-assembly/lib/, never another template; lib/ imports no template (FE-007).',
      from: { path: '^src/page-assembly/([^/]+)/' },
      to: { path: '^src/page-assembly/', pathNot: '^src/page-assembly/($1|lib)/' },
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
        'A route composes; it does not lay out. src/app/** renders a page template from src/page-assembly/ and reaches src/components/** only through SiteShell, and the Episodes area not at all (FE-007).',
      from: { path: '^src/app/' },
      to: { path: ['^src/components/', '^src/episodes/'], pathNot: '^src/components/site-shell\\.tsx$' },
    },
  ],
  required: [
    {
      name: 'page-composes-a-template',
      severity: 'error',
      comment:
        'Every src/app/**/page.tsx renders a page template from a template folder of src/page-assembly/, never lib/ alone (FE-007).',
      module: { path: '^src/app/(.+/)?page\\.tsx$' },
      to: { path: '^src/page-assembly/(?!lib/)[^/]+/' },
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
