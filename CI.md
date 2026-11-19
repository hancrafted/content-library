# CI

How a change travels from a local commit to https://hancrafted.net, as of PR #781 (the docs lane). The workflows are the source of truth: `.github/workflows/ci.yml`, `deploy-cloudflare.yml`, `nightly.yml`, `security.yml`, `deploy.yml`; the local hooks are `.husky/pre-commit` and `.husky/pre-push` (plans in `tools/verify/verify.pure.ts`). The prose reference is `docs/features/hosting.md`.

## From commit to production

```mermaid
flowchart TD
  %% ── Local ──────────────────────────────────────────────
  subgraph LOCAL["Local machine (husky hooks)"]
    direction TB
    C([git commit]) --> PC["pre-commit<br/>drive guard<br/>(Decision docs only on decisions/*)"]
    PC --> VC["verify:commit<br/>1. preflight ‖ check:events<br/>2. lint-staged<br/>3. archgate check --staged ‖ lint:boundaries ‖ typecheck ‖ vitest --changed"]
    VC --> CM["commit-msg<br/>/commit gate: header, ### body, Source: trailer"]
    CM --> P([git push])
    P --> PP["pre-push: verify:push<br/>1. preflight ‖ archgate:full<br/>2. lint ‖ boundaries ‖ format ‖ typecheck ‖ full fast suite ‖ knip ‖ check:docs<br/>3. test:slow --changed merge-base"]
    PP --> BQ{"push to main, no merge-base,<br/>or changeKind().build?"}
    BQ -- yes --> LB["4. build<br/>5. test:build"]
    BQ -- "no (e.g. Markdown only)" --> SENT
    LB --> SENT([refs sent to GitHub])
  end

  SENT --> TRIG

  %% ── CI on push ─────────────────────────────────────────
  subgraph CIW["ci.yml — on push, every branch (a newer push to the same ref cancels the older run)"]
    direction TB
    TRIG([push event]) --> FAN{{"3 jobs start in parallel<br/>each: checkout, setup-node 24, npm ci"}}

    FAN --> S0
    FAN --> U0
    FAN --> E0

    %% static
    subgraph STATIC["static — 'preflight, archgate, lint, typecheck' (required)"]
      S0{"ref = main?"} -- no --> SK["Detect the change kind<br/>git diff merge-base..HEAD<br/>| verify:change-kind<br/>→ build=, docs-only="]
      S0 -- "yes: step skipped,<br/>outputs empty = full run" --> S1
      SK --> S1["preflight<br/>archgate:full<br/>format:check<br/>check:docs"]
      S1 --> SD{"docs-only?"}
      SD -- no --> S2["lint<br/>typecheck<br/>knip"]
      SD -- yes --> SX[skip lint, typecheck, knip]
    end

    %% unit
    subgraph UNIT["unit — 'unit tests' (required)"]
      U0{"ref = main?"} -- no --> UK[Detect the change kind]
      U0 -- yes --> UF
      UK --> UD{"docs-only?"}
      UD -- no --> UF["npm test<br/>(full fast suite, JSON report)"]
      UD -- yes --> UC["vitest run --changed origin/main<br/>--passWithNoTests (JSON report)"]
      UF --> UB["Fail on fast-suite tests over 3 s<br/>(ARCH-003 §4.4)"]
      UC --> UB
    end

    %% export
    subgraph EXPORT["export — 'build'"]
      E0{"ref = main?"} -- no --> EK["Detect the change kind<br/>outputs: build, docs-only"]
      E0 -- yes --> EB
      EK --> ED{"docs-only?"}
      ED -- no --> EB["npm run build<br/>LIST_UPCOMING_EPISODES = true off main, unset on main"]
      EB --> EU["upload artifact 'out'<br/>kept 30 days on main, 1 day elsewhere"]
      ED -- yes --> EX[skip build and upload]
    end

    EU --> BT
    EX --> BTS
    subgraph BTEST["build-test — 'post-build tests'"]
      BT["download out/<br/>npm run test:build"]
      BTS[skipped: docs-only]
    end

    EU --> PVQ{"build = true<br/>and ref ≠ main<br/>and this repo<br/>and not Dependabot?"}
    EX --> PVQ
    PVQ -- yes --> PV["preview<br/>download out/ → wrangler pages deploy<br/>→ &lt;branch&gt;.hancrafted.pages.dev"]
    PVQ -- no --> PVX[preview skipped]

    BT --> G
    BTS --> G
    EU --> G
    EX --> G
    G{"gate — 'build, post-build tests' (required, if: always())<br/>export = success AND<br/>(build-test = success OR<br/>build-test = skipped AND docs-only)"}
    G -- pass --> GR([run green])
    G -- fail --> RR([run red])
  end

  S2 --> GR
  SX --> GR
  UB --> GR

  %% ── PR and merge ──────────────────────────────────────
  GR --> PR{"PR to main<br/>(push run on its head commit<br/>is the PR's checks)"}
  PR -- "3 required checks green" --> M([Operator merges to main])
  M --> TRIG2([push to main → ci.yml full run,<br/>no docs lane, no preview])
  TRIG2 -. same jobs as above .-> CIW

  %% ── Production ────────────────────────────────────────
  subgraph DEPLOY["deploy-cloudflare.yml — workflow_run: CI completed on main (never cancelled mid-flight)"]
    direction TB
    WR{"CI run on main<br/>succeeded?"} -- no --> DN([nothing deployed])
    WR -- yes --> PICK["Pick CI run<br/>must be CI, on main, success"]
    WD([workflow_dispatch<br/>optional run-id = rollback]) --> PICK
    PICK --> DL["download that run's out/<br/>(no checkout, no build)"]
    DL --> DP["wrangler pages deploy --branch=main"]
    DP --> LIVE([https://hancrafted.net])
  end

  TRIG2 --> WR
```

## The change kind

Every push off `main` is classified once per job by `npm run -s verify:change-kind` (`tools/verify/change-kind.pure.ts`) over the paths changed since the merge-base with `origin/main`.

```mermaid
flowchart LR
  P[changed paths since merge-base] --> E{"empty list?"}
  E -- yes --> FULL["docs-only = false<br/>full run"]
  E -- no --> A{"every path matches **/*.md?<br/>(markdown-harness.config.yaml does not)"}
  A -- yes --> DOCS["docs-only = true<br/>docs lane"]
  A -- no --> FULL
  P --> B{"any path in EXPORT_PATHS<br/>and not src/**/*.md?"}
  B -- yes --> BT["build = true<br/>preview runs, pre-push builds"]
  B -- no --> BF["build = false<br/>no preview; CI still builds<br/>unless docs-only"]
```

| Lane                       | static                                       | unit                    | export        | post-build tests | preview |
| -------------------------- | -------------------------------------------- | ----------------------- | ------------- | ---------------- | ------- |
| `main`                     | all                                          | full suite              | build, 30-day | runs             | never   |
| branch, export input       | all                                          | full suite              | build, 1-day  | runs             | yes     |
| branch, other non-Markdown | all                                          | full suite              | build, 1-day  | runs             | no      |
| branch, Markdown only      | preflight, archgate:full, format, check:docs | `--changed origin/main` | skipped       | skipped          | no      |

## Scheduled and side workflows

```mermaid
flowchart LR
  N(["nightly.yml<br/>cron 03:00 UTC daily + manual"]) --> N1["test:slow (whole slow lane)"]
  N --> N2["fast-suite timings vs 2 s budget"]
  N1 -- failure --> NI["file a needs-triage issue"]
  N2 -- over budget --> NI

  SEC(["security.yml<br/>pull_request + Mondays 03:00 UTC"]) --> T1["Trivy: deps, config/IaC, secrets<br/>report all, block only on real risk"]

  GP(["deploy.yml (temporary)<br/>push to main + manual"]) --> G1["build for the page list<br/>→ redirect stubs to hancrafted.net<br/>→ GitHub Pages"]
```
