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
const COMPOSITION_REGISTRY_NAMES = '(registry|episode-registry\\.generated)';
const COMPOSITION_REGISTRY = `^src/episodes/lib/${COMPOSITION_REGISTRY_NAMES}\\.ts$`;
// The tests that run over every composed Episode and tooling page through those registries, rendering Slides.
const REGISTRY_TESTS =
  '^src/episodes/lib/(placement-markers|published-anchors|registry|slide-dom-ids|slide-folders)\\.test\\.ts$';
// The product areas (spec #348): each a top-level folder of src/, between page assembly above and the content store
// below. AREA captures the area's name, so a rule's `to` can say "this same area" as `^src/$1/`.
const AREA_NAMES = '(episodes|events|explorable-explanations|pipeline)';
const AREA = `^src/${AREA_NAMES}/`;
// The areas with tier folders, `components/`, `lib/` and `hooks/` as needed, named the same everywhere (FE-007); the
// Explorable explanations area holds one self-contained folder per explanation instead. TIERED adds shared.
const TIERED_AREAS = '(episodes|events|pipeline)';
const TIERED = '(shared|episodes|events|pipeline)';
const TIER_LIB = `^src/${TIERED}/lib/`;
const TIER_HOOKS = `^src/${TIERED}/hooks/`;
// What a Slide, a slide-shared part or an Episode may reach of plain logic: src/shared/lib/ and the Episodes area's lib/.
const LIB = '^src/(shared|episodes)/lib/';
// Browser hooks a Slide's client widget may reach: src/shared/hooks/ and the Episodes area's hooks/.
const HOOKS = '^src/(shared|episodes)/hooks/';
// Shared (spec #348): what every layer uses and knows nothing of the domain — UI primitives, design system, i18n,
// generic hooks and lib, and page chrome. The UI kit, the primitives Slide parts share, and page chrome by name.
const SHARED_UI = '^src/shared/components/ui/';
const SHARED_LIB = '^src/shared/lib/';
const SHARED_HOOKS = '^src/shared/hooks/';
const PAGE_CHROME = '^src/shared/page-chrome/';
// The Episode page container and the adapter that builds the Context drawer's input: the Episodes area's one way into
// page chrome's table of contents and Context drawer.
const EPISODE_CONTAINER =
  '^src/episodes/components/episode-page/(episode-page-container\\.(tsx|pure\\.ts)|context-drawer-input(\\.pure)?\\.ts)$';

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
// kit, the core components (server files only, see the client rule), hooks and lib.
const SLIDE_SHARED_REACH = [
  '^src/episodes/components/(slide-master|slide-shared)/',
  '^src/shared/components/(ui|core-components)/',
  '^src/explorable-explanations/',
  HOOKS,
  LIB,
];

// The primitives slide-shared parts share, one subfolder each: a leaf (FE-007 §5.2).
// An Episode's metadata file, an Event's copy's under `by-event/<event>/`: a record the content store loads (FE-013).
const EPISODE_METADATA =
  '^src/episodes/(by-event/[^/]+/[^/]+|(?!components/|lib/|hooks/|tooling/)[^/]+)/episode-metadata\\.ts$';
// The store's schemas: a leaf every tier may import record types from (FE-007 §2.7).
const STORE_SCHEMAS = '^src/content-store/schemas/';
// The store's catalogue, the delivery policy readers import beside the entry: every module but the page catalogue,
// which the entry serves over its records.
const STORE_CATALOGUE = '^src/content-store/catalogue/(?!page-catalogue\\.)';

const CORE_COMPONENTS = '^src/shared/components/core-components/';

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
        "A hook runs only in the browser. Reach a hooks/ tier folder (src/shared/hooks/ or an area's) from a *.client.tsx leaf, another hook, or a test — never from a Server Component (FE-006).",
      from: { pathNot: ['\\.client\\.tsx$', TIER_HOOKS, '\\.test\\.tsx?$'] },
      to: { path: TIER_HOOKS },
    },
    {
      name: 'prefs-storage-reached-only-from-client',
      severity: 'error',
      comment:
        'src/shared/lib/prefs-storage.ts touches window.localStorage. Reach it from a hook, a *.client.tsx leaf or a test — a Server Component would read empty prefs at build time and render silently wrong (FE-006). Named by path: no classifier marks a browser-API module, so a second one needs this rule widened by hand.',
      from: { pathNot: ['\\.client\\.tsx$', TIER_HOOKS, '\\.test\\.tsx?$'] },
      to: { path: '^src/shared/lib/prefs-storage\\.ts$' },
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
      to: { path: '^src/shared/page-chrome/table-of-contents/' },
    },
    {
      name: 'page-chrome-reached-only-from-page-assembly-or-container',
      severity: 'error',
      comment:
        'Page chrome (src/shared/page-chrome/: header, footer bar, toggles, table of contents, Context drawer) is reached from page assembly or the Episode page container, plus SiteShell from the root layouts. No product area part, store module or other shared module imports it; what it needs from the domain arrives as props (FE-004, FE-007).',
      from: {
        pathNot: [
          PAGE_CHROME,
          '^src/page-assembly/',
          EPISODE_CONTAINER,
          '^src/app/(\\(en\\)|\\[locale\\])/layout\\.tsx$',
          '\\.test\\.tsx?$',
        ],
      },
      to: { path: PAGE_CHROME },
    },
    {
      name: 'context-drawer-reached-only-from-container',
      severity: 'error',
      comment:
        'The Context drawer is reached only through EpisodePageContainer, which derives its entries from the same anchors the slides carry; no other module imports it (FE-010 §5).',
      from: {
        pathNot: [
          '^src/episodes/components/episode-page/(episode-page-container\\.tsx|context-drawer-input(\\.pure)?\\.ts)$',
          '^src/shared/page-chrome/context-drawer/',
        ],
      },
      to: { path: '^src/shared/page-chrome/context-drawer/' },
    },
    {
      name: 'context-drawer-takes-input-only',
      severity: 'error',
      comment:
        'The Context drawer knows nothing of Episodes: it renders from one ContextDrawerInput and observes the ids it is given. Its components, hooks and lib files MUST NOT import Episode, table-of-contents, route or next-intl code (FE-010 §8). The one adapter that builds the input lives under src/episodes/components/episode-page/.',
      from: {
        path: '^src/shared/(page-chrome/context-drawer/|hooks/use-(context-|reading-line)|lib/(context-drawer|context-link|roving-focus|reading-line)\\.pure\\.ts$)',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: [
          '^src/episodes/',
          '^src/shared/page-chrome/table-of-contents/',
          '^src/shared/hooks/use-table-of-contents',
          '^src/shared/lib/(routes|table-of-contents)',
          '^src/content-store/',
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
        'A Slide folder (episodes/<ep>/slides/<slide>/, or a pool Slide, episodes/slide-pool/<slide>/) imports only its own files and the global shared locations: src/episodes/components/slide-master/, src/episodes/components/slide-shared/, src/explorable-explanations/, src/shared/components/ui/, src/shared/hooks/, src/shared/lib/, src/episodes/hooks/ and src/episodes/lib/. Never another Slide, a pool Slide included, the Episode file, or anything else Episode-local; a part two Slides share moves to src/episodes/components/slide-shared/ (FE-007).',
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
        'src/episodes/components/slide-shared/ holds parts several Slides of any Episode share. A part takes serializable props: its server files reach only other slide-shared parts, the UI kit (src/shared/components/ui/), the core components (src/shared/components/core-components/) and lib — never a Slide, an Episode, the Slide master or its kit, so a Slide copied into another Episode finds it unchanged (FE-002, FE-007 §5, epic #51).',
      from: { path: '^src/episodes/components/slide-shared/', pathNot: ['\\.test\\.ts$', SLIDE_SHARED_CLIENT] },
      to: { pathNot: ['^src/episodes/components/slide-shared/', SHARED_UI, CORE_COMPONENTS, LIB, 'node_modules'] },
    },
    {
      name: 'slide-shared-client-reaches-only-own-part-hooks-and-lib',
      severity: 'error',
      comment:
        "A slide-shared part's *.client.tsx leaf runs in the browser. It sits in its part's folder (src/episodes/components/slide-shared/<part>/) and reaches only that folder, src/shared/hooks/ and src/shared/lib/ — never another part, the UI kit, a Slide or the Slide master. The one exception is src/shared/components/core-components/, which any slide-shared part, client leaf included, may import (FE-006 §5, FE-007 §5.2).",
      from: { path: SLIDE_SHARED_CLIENT },
      to: { pathNot: ['^src/episodes/components/slide-shared/$1/', CORE_COMPONENTS, HOOKS, LIB, 'node_modules'] },
    },
    {
      name: 'explorable-explanation-reaches-shared-ui-and-lib',
      severity: 'error',
      comment:
        'src/explorable-explanations/ holds the Explorable explanations several Slides show. An explanation takes serializable props: its server files reach only other explanations, the core components (src/shared/components/core-components/), the UI kit (src/shared/components/ui/) and lib — never another product area (a Slide, an Episode, slide-shared, the Slide master) (FE-012, FE-007 §5, design-ADR 0016 decision 6).',
      from: { path: EXPLANATIONS, pathNot: ['\\.test\\.ts$', EXPLANATION_CLIENT] },
      to: {
        pathNot: [EXPLANATIONS, CORE_COMPONENTS, SHARED_UI, SHARED_LIB, 'node_modules'],
      },
    },
    {
      name: 'explorable-explanation-client-reaches-only-own-folder-core-hooks-and-lib',
      severity: 'error',
      comment:
        "An Explorable explanation's *.client.tsx leaf runs in the browser. It sits in its explanation's folder (src/explorable-explanations/<name>/) and reaches only that folder, src/shared/components/core-components/, src/shared/hooks/ and src/shared/lib/ — never another explanation, a slide-shared part, the UI kit, a Slide or the Slide master (FE-006 §5, FE-007 §5.2).",
      from: { path: EXPLANATION_CLIENT },
      to: {
        pathNot: ['^src/explorable-explanations/$1/', CORE_COMPONENTS, SHARED_HOOKS, SHARED_LIB, 'node_modules'],
      },
    },
    {
      name: 'core-components-are-a-leaf',
      severity: 'error',
      comment:
        'src/shared/components/core-components/ holds the primitives every slide-shared part shares. It is a leaf: its files import only core-components/, src/shared/hooks/ and src/shared/lib/ — never another slide-shared part, the UI kit, a Slide or the Slide master (FE-007 §5.2).',
      from: { path: CORE_COMPONENTS, pathNot: '\\.test\\.tsx?$' },
      to: { pathNot: [CORE_COMPONENTS, SHARED_HOOKS, SHARED_LIB, 'node_modules'] },
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

    // FE-007: layering. Layers run app → page assembly → product areas → content store → shared, and tiers
    // components → hooks → lib inside each; an edge may skip downward, never point upward. Boundary rules above (FE-006)
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
        "A lib/ tier folder (src/shared/lib/ or an area's) imports no React — not runtime, not types — so every lib module stays a plain module a vitest test imports, and a skill script runs under plain node, without a DOM (FE-007).",
      from: { path: TIER_LIB, pathNot: REGISTRY_TESTS },
      to: { path: '(^|/)node_modules/(@types/)?(react|react-dom)/' },
    },
    {
      name: 'lib-tsx-never-imported',
      severity: 'error',
      comment:
        "JSX needs a .tsx file; a lib/ tier folder (src/shared/lib/ or an area's) holds none, so nothing may import a .tsx module from one (FE-007).",
      from: {},
      to: { path: `${TIER_LIB}.+\\.tsx$` },
    },
    {
      name: 'lib-imports-no-upper-tier',
      severity: 'error',
      comment:
        "A lib/ tier folder (src/shared/lib/ or an area's) is the bottom tier of its folder: it MUST NOT import src/app, page assembly, a component, page chrome, a hook, an Episode's folder or the content store — except the store's schemas and catalogue, the leaves that name records and their ids. Shared lib reaches neither (shared-knows-no-domain). The composition registries in src/episodes/lib/ import every Episode's record and sit above it (FE-007).",
      from: { path: TIER_LIB, pathNot: [COMPOSITION_REGISTRY, REGISTRY_TESTS] },
      to: {
        path: [
          '^src/(app|page-assembly)/',
          `^src/${TIERED}/(components|page-chrome|hooks)/`,
          '^src/episodes/(?!lib/)',
          '^src/content-store/(?!(schemas|catalogue)/)',
        ],
      },
    },
    {
      name: 'hooks-import-no-upper-tier',
      severity: 'error',
      comment:
        "A hooks/ tier folder (src/shared/hooks/ or an area's) sits above lib only: it MUST NOT import src/app, page assembly, a component, page chrome, the content store or an Episode's folder — except the store's schemas (FE-007).",
      from: { path: TIER_HOOKS },
      to: {
        path: [
          '^src/(app|page-assembly|content-store)/',
          `^src/${TIERED}/(components|page-chrome)/`,
          '^src/episodes/(?!(lib|hooks)/)',
        ],
        pathNot: STORE_SCHEMAS,
      },
    },
    // FE-013 and FE-007 §2.7: the content store is the one reader of records, and its own tier.
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
        'Outside the content store, imports reach only its entry, src/content-store/store.ts, its schemas for record types, and its catalogue (catalogue/: slug lists, Episode id, record routes, visibility predicate) but not the page catalogue the entry serves; refusals, records and Featured stay free to change behind it (FE-013).',
      from: { pathNot: ['^src/content-store/', '\\.test\\.tsx?$'] },
      to: { path: '^src/content-store/', pathNot: ['^src/content-store/store\\.ts$', STORE_SCHEMAS, STORE_CATALOGUE] },
    },
    {
      name: 'episode-metadata-reaches-only-schemas-and-lib',
      severity: 'error',
      comment:
        "An Episode's episode-metadata.ts is a record: it imports only src/content-store/schemas/**, src/shared/lib/** and zod, so the store reading it closes no cycle (FE-007, FE-013).",
      from: { path: EPISODE_METADATA },
      to: { pathNot: ['^src/content-store/schemas/', '^src/shared/lib/', '(^|/)node_modules/zod/'] },
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
        "src/content-store/** sits below the product areas and above shared: it imports no React and nothing outside itself and src/shared/ — no route, page assembly, product area or page chrome — except an Episode's episode-metadata.ts, its one upward edge. Its tests may also read the Episode folders through the walker (FE-007).",
      from: { path: '^src/content-store/', pathNot: '\\.test\\.ts$' },
      to: {
        path: [
          '^src/(?!content-store/|shared/)',
          '^src/shared/(components|page-chrome|hooks)/',
          '(^|/)node_modules/(@types/)?(react|react-dom)/',
        ],
        pathNot: EPISODE_METADATA,
      },
    },
    {
      name: 'shared-knows-no-domain',
      severity: 'error',
      comment:
        'src/shared/** knows nothing of the domain: it imports only other shared modules, never the content store, its schemas included, a product area, page assembly or a route. What page chrome needs from the domain arrives as props (FE-007).',
      from: { path: '^src/shared/' },
      to: { path: '^src/', pathNot: '^src/shared/' },
    },
    // Relies on options.exclude '\.css$': site-shell.tsx imports @/app/globals.css, so dropping that exclusion fires this rule.
    {
      name: 'layers-never-import-app',
      severity: 'error',
      comment:
        'Everything outside src/app/ sits below the routes: page assembly, the product areas, the content store and shared MUST NOT import src/app/** (FE-007).',
      from: { path: '^src/(?!app/)' },
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
      to: { path: '^src/shared/page-chrome/site-shell\\.tsx$' },
    },
    {
      name: 'route-reaches-components-only-via-roots',
      severity: 'error',
      comment:
        'A route composes; it does not lay out. src/app/** renders a page template from src/page-assembly/ and reaches shared components and page chrome only through SiteShell, and no product area at all (FE-007).',
      from: { path: '^src/app/' },
      to: {
        path: ['^src/shared/(components|page-chrome)/', '^src/(episodes|events|explorable-explanations|pipeline)/'],
        pathNot: '^src/shared/page-chrome/site-shell\\.tsx$',
      },
    },
    // The area rules (spec #348, FE-007 §2.3–§2.5 and §2.8). With the layer rules above (layers-never-import-app,
    // page-assembly-reached-only-from-app, content-store-tier, shared-knows-no-domain) they hold every product area:
    // an area is reached only from page assembly, and two areas meet only there.
    {
      name: 'areas-never-import-each-other',
      severity: 'error',
      comment:
        "A product area (src/episodes/, src/events/, src/explorable-explanations/, src/pipeline/) imports no other area. Two areas meet only in page assembly, which builds one area's parts and passes them to the other as props, as the Event page passes ready-made Episode cards to the Playlist list. The one exception is a Slide folder showing an Explorable explanation; slide-folder-reaches-only-own-and-shared holds a Slide, and episode-tests-reach-only-slide-parts the Episode tests that render one (FE-007).",
      from: { path: AREA, pathNot: [SLIDE_FOLDER, `${EPISODE_CONTENT}.+\\.test\\.tsx?$`] },
      to: { path: AREA, pathNot: '^src/$1/' },
    },
    {
      name: 'page-assembly-reaches-areas-through-tier-folders',
      severity: 'error',
      comment:
        "Page assembly reaches a product area only through its components/ and lib/ folders — never its hooks/, an Episode's own folder or a file at the area's root, and there are no per-area index.ts barrels. The Explorable explanations area holds one self-contained folder per explanation (FE-012), so page assembly reaches an explanation's folder (FE-007).",
      from: { path: '^src/page-assembly/' },
      to: {
        path: AREA,
        pathNot: [`^src/${TIERED_AREAS}/(components|lib)/`, '^src/explorable-explanations/[^/]+/'],
      },
    },
    {
      name: 'src-never-imports-skills-or-tools',
      severity: 'error',
      comment:
        'Nothing under src/ imports skills/ or tools/: a skill or a tool runs the product, it never houses what the product imports. Move the module into its area under src/ (FE-007).',
      from: { path: '^src/' },
      to: { path: '^(skills|tools)/' },
    },
    {
      name: 'skills-and-tools-reach-src-through-area-lib-or-store-entry',
      severity: 'error',
      comment:
        "skills/ and tools/ reach src/ only through a product area's lib/ folder (src/pipeline/lib/, src/episodes/lib/, …) or the content store's entry, src/content-store/store.ts: plain modules that run under node. Logic a skill or a tool needs moves into its area's lib/ (FE-007).",
      from: { path: '^(skills|tools)/' },
      to: {
        path: '^src/',
        pathNot: [`^src/${TIERED_AREAS}/lib/`, '^src/content-store/store\\.ts$'],
      },
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
      to: { path: '^src/shared/page-chrome/site-shell\\.tsx$' },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.css$' },
  },
};
