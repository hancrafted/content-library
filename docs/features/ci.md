---
type: feature-guide
title: CI
stale_after: 2027-05-19T00:00:00Z
---

# CI

Read before touching a husky hook, a workflow in `.github/workflows/`, or the plans in `tools/verify/`. How a change travels from a local commit to a tested `out/` that Cloudflare Pages serves; what Cloudflare does with it, the domain and the headers: `docs/features/hosting.md`. Every command in a box is explained in the [Glossary](#glossary).

**Colour key** (same in every chart):

```mermaid
flowchart LR
  S[npm ci]:::setup
  Q{decision}:::decide
  C[static check]:::check
  T[test]:::test
  B[build / artifact]:::build
  D[deploy]:::deploy
  G{{required gate}}:::gate
  O([outcome]):::outcome

  classDef setup fill:#e5e7eb,stroke:#6b7280,color:#111
  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef test fill:#dcfce7,stroke:#16a34a,color:#111
  classDef build fill:#ffedd5,stroke:#ea580c,color:#111
  classDef deploy fill:#ede9fe,stroke:#7c3aed,color:#111
  classDef gate fill:#fee2e2,stroke:#dc2626,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

## 1. The process at a glance

```mermaid
flowchart LR
  A([git commit]):::outcome --> B[pre-commit]:::check
  B --> C([git push]):::outcome
  C --> D[pre-push]:::test
  D --> E[ci.yml on the branch]:::check
  E --> F{{PR checks green?}}:::gate
  F -- yes --> G([merge to main]):::outcome
  G --> H[ci.yml on main]:::build
  H --> I[deploy-cloudflare.yml]:::deploy
  I --> J([hancrafted.net]):::outcome
  E -. branch .-> P[preview deploy]:::deploy

  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef test fill:#dcfce7,stroke:#16a34a,color:#111
  classDef build fill:#ffedd5,stroke:#ea580c,color:#111
  classDef deploy fill:#ede9fe,stroke:#7c3aed,color:#111
  classDef gate fill:#fee2e2,stroke:#dc2626,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

- **Local hooks** catch most failures before anything leaves the machine (section 2).
- **CI on a branch** runs one of two lanes: the full run, or the docs lane when every changed path is Markdown (section 3).
- **`main`** always gets the full run; its tested `out/` is what production publishes (section 4).
- **Scheduled workflows** run beside this, never blocking a merge (section 5).

## 2. Local hooks

### 2.1 pre-commit

`.husky/pre-commit`. Steps on one line run in parallel.

```mermaid
flowchart LR
  A([git commit]):::outcome --> G[drive guard]:::check
  G --> P1[preflight]:::check & P2[check:events]:::check
  P1 & P2 --> L[lint-staged]:::check
  L --> A1[archgate check --staged]:::check & A2[lint:boundaries]:::check & A3[typecheck]:::check & A4[vitest run --changed]:::test
  A1 & A2 & A3 & A4 --> M[commit-msg]:::check
  M --> O([commit created]):::outcome

  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef test fill:#dcfce7,stroke:#16a34a,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

### 2.2 pre-push

`.husky/pre-push` runs `verify:push`: the full `verify` plan, the slow tests the branch reaches, and a build only when the push could change the export. A Markdown-only push still runs the full `verify` and skips only the build, so it is the backstop for a test the CI docs lane's `--changed` misses.

```mermaid
flowchart TD
  A([git push]):::outcome --> P1[preflight]:::check & P2[archgate:full]:::check
  P1 & P2 --> V1[oxlint]:::check & V2[lint:boundaries]:::check & V3[format:check]:::check & V4[typecheck]:::check & V5[npm test]:::test & V6[knip]:::check & V7[check:docs]:::check
  V1 & V2 & V3 & V4 & V5 & V6 & V7 --> S[test:slow --changed]:::test
  S --> Q{"push to main,<br/>no merge-base, or<br/>build = true?"}:::decide
  Q -- yes --> B[build]:::build --> TB[test:build]:::test --> O([refs sent]):::outcome
  Q -- no --> O

  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef test fill:#dcfce7,stroke:#16a34a,color:#111
  classDef build fill:#ffedd5,stroke:#ea580c,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

## 3. CI on push (`ci.yml`)

Runs on every push to every branch; a newer push to the same branch cancels the older run. A PR shows the push run on its head commit as its checks.

### 3.1 Job graph

```mermaid
flowchart LR
  T([push]):::outcome --> S[static]:::check & U[unit]:::test & E[export]:::build
  E --> BT[build-test]:::test
  E --> PV[preview]:::deploy
  E & BT --> G{{gate}}:::gate
  S & U & G --> R([run result]):::outcome

  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef test fill:#dcfce7,stroke:#16a34a,color:#111
  classDef build fill:#ffedd5,stroke:#ea580c,color:#111
  classDef deploy fill:#ede9fe,stroke:#7c3aed,color:#111
  classDef gate fill:#fee2e2,stroke:#dc2626,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

Required checks on `main`: `static` ("preflight, archgate, lint, typecheck"), `unit` ("unit tests") and `gate` ("build, post-build tests").

### 3.2 The change kind

`static`, `unit` and `export` each run `verify:change-kind` after `npm ci`, over the paths changed since the merge-base with `origin/main`. On `main` the step is skipped, so every job takes the full run.

```mermaid
flowchart TD
  P[git diff merge-base..HEAD]:::setup --> K[verify:change-kind]:::check
  K --> E{empty diff?}:::decide
  E -- yes --> F([docs-only = false]):::outcome
  E -- no --> M{"every path *.md?"}:::decide
  M -- yes --> D([docs-only = true]):::outcome
  M -- no --> F
  K --> X{"a path in EXPORT_PATHS,<br/>not src/**/*.md?"}:::decide
  X -- yes --> BT([build = true]):::outcome
  X -- no --> BF([build = false]):::outcome

  classDef setup fill:#e5e7eb,stroke:#6b7280,color:#111
  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

- **`docs-only`** picks the lane: true when every changed path matches `**/*.md`. `markdown-harness.config.yaml` is not Markdown and an empty diff is not a docs change, so both take the full run. The site build reads no Markdown, so the docs lane skips it. `main` always takes the full run, so every successful `main` run holds an `out/` for deploy and rollback.
- **`build`** gates the preview and the local pre-push build: true when a changed path is an export input. The diff is taken against the merge-base, so a branch pushed without a PR works too.
- **Export inputs** live in one place: `EXPORT_PATHS` in `tools/verify/change-kind.pure.ts`, shared by pre-push and the `preview` condition, minus Markdown under `src/` (no build step reads it). Add a path there when the build starts reading it. Its tests fail if `next.config.ts` starts importing `*.md`, if `preview` stops being gated on `export`'s `build` output or on `main`'s exclusion, or if `test:build` moves back into `export`.

| Lane                       | static                                             | unit                    | export         | build-test | preview |
| -------------------------- | -------------------------------------------------- | ----------------------- | -------------- | ---------- | ------- |
| `main`                     | all                                                | `npm test`              | build, 30 days | runs       | never   |
| branch, export input       | all                                                | `npm test`              | build, 1 day   | runs       | yes     |
| branch, other non-Markdown | all                                                | `npm test`              | build, 1 day   | runs       | no      |
| branch, Markdown only      | preflight, archgate:full, format:check, check:docs | `--changed origin/main` | skipped        | skipped    | no      |

### 3.3 static

```mermaid
flowchart TD
  A[npm ci]:::setup --> K[verify:change-kind]:::check
  K --> P[preflight]:::check --> AR[archgate:full]:::check
  AR --> Q{docs-only?}:::decide
  Q -- no --> L[lint]:::check --> F[format:check]:::check --> TC[typecheck]:::check --> KN[knip]:::check --> CD[check:docs]:::check
  Q -- yes --> F2[format:check]:::check --> CD2[check:docs]:::check

  classDef setup fill:#e5e7eb,stroke:#6b7280,color:#111
  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
```

### 3.4 unit

```mermaid
flowchart TD
  A[npm ci]:::setup --> K[verify:change-kind]:::check --> Q{docs-only?}:::decide
  Q -- no --> T[npm test]:::test
  Q -- yes --> TC["vitest run --changed origin/main"]:::test
  T & TC --> B[over-budget.ts 3000]:::gate

  classDef setup fill:#e5e7eb,stroke:#6b7280,color:#111
  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef test fill:#dcfce7,stroke:#16a34a,color:#111
  classDef gate fill:#fee2e2,stroke:#dc2626,color:#111
```

### 3.5 export, build-test and preview

```mermaid
flowchart TD
  A[npm ci]:::setup --> K[verify:change-kind]:::check --> Q{docs-only?}:::decide
  Q -- no --> B[npm run build]:::build --> U[upload-artifact out]:::build
  Q -- yes --> SK([no build, no artifact]):::outcome
  U --> BT[test:build]:::test
  U --> PQ{"build = true and<br/>not main?"}:::decide
  PQ -- yes --> PV[wrangler pages deploy]:::deploy --> PU([branch.hancrafted.pages.dev]):::outcome
  PQ -- no --> NP([no preview]):::outcome

  classDef setup fill:#e5e7eb,stroke:#6b7280,color:#111
  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef test fill:#dcfce7,stroke:#16a34a,color:#111
  classDef build fill:#ffedd5,stroke:#ea580c,color:#111
  classDef deploy fill:#ede9fe,stroke:#7c3aed,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

- **export** builds `out/` with an empty `NEXT_PUBLIC_BASE_PATH`, `SITE_URL=https://hancrafted.net` and, on every ref but `main`, `LIST_UPCOMING_EPISODES=true` (what each target shows: `docs/features/hosting.md`). `npm run build` runs `art` first (`prebuild`). It uploads `out/`, hidden files included, kept 30 days on `main` for rollback and 1 day elsewhere, and does not run the post-build suite.
- **build-test** needs only `export`: it downloads `out/`, runs `npm ci` and `npm run test:build` under the same env the build used.
- **preview** needs `export` and runs when `build` is true, the ref is not `main`, the repository is this one (not a fork) and the actor is not Dependabot: forks and Dependabot have no Cloudflare secrets. A branch that changes no export input (docs, skills, tooling) gets no preview. The preview may exist while `build-test` is red; where it lands and when it may go to a client: `docs/features/hosting.md`.

### 3.6 The gate

The `gate` job, named "build, post-build tests" (the context the `main` ruleset requires), needs `export` and `build-test` and runs `if: always()`. It fails unless `export` succeeded and `build-test` succeeded, or was skipped on a `docs-only` push, so a skipped job never stands in for a pass otherwise.

```mermaid
flowchart TD
  E{export succeeded?}:::decide -- no --> R([red]):::gate
  E -- yes --> T{build-test?}:::decide
  T -- success --> G([green]):::outcome
  T -- skipped --> D{docs-only?}:::decide
  D -- yes --> G
  D -- no --> R
  T -- failed --> R

  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef gate fill:#fee2e2,stroke:#dc2626,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

## 4. Production deploy and rollback (`deploy-cloudflare.yml`)

Starts when CI completes on `main`, and only when that run succeeded, so it waits for CI's run on the merged commit. A failed or cancelled CI run deploys nothing, and a newer merge cancels the older one's CI. It never builds: it downloads that run's `out/` (the build CI tested) and publishes it in the `production` environment. A production deploy is never cancelled mid-flight.

```mermaid
flowchart TD
  W([CI completed on main]):::outcome --> Q{succeeded?}:::decide
  Q -- no --> N([nothing deployed]):::outcome
  Q -- yes --> P[gh run view]:::check
  M([workflow_dispatch run-id]):::outcome --> P
  P --> V{"CI, on main,<br/>success?"}:::decide
  V -- no --> F([fail]):::gate
  V -- yes --> D[download-artifact out]:::build --> W2[wrangler pages deploy --branch=main]:::deploy --> L([hancrafted.net]):::outcome

  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef build fill:#ffedd5,stroke:#ea580c,color:#111
  classDef deploy fill:#ede9fe,stroke:#7c3aed,color:#111
  classDef gate fill:#fee2e2,stroke:#dc2626,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

**Rollback:** run the workflow by hand (`workflow_dispatch`). Without a `run-id` it publishes the newest successful CI run on `main`; with one, that run's `out/`, which must be a successful CI run on `main` whose artifact is still inside its 30 days. Redeploying an older run is the rollback.

## 5. Scheduled and side workflows

None of these blocks a merge.

```mermaid
flowchart LR
  N([nightly.yml · daily 03:00 UTC]):::outcome --> N1[test:slow]:::test & N2[vitest run json]:::test
  N2 --> N3[over-budget 2 s]:::gate
  N1 & N3 -- failure --> I[file-issue.sh]:::check

  S([security.yml · PRs, Mondays]):::outcome --> T[trivy]:::check

  G([deploy.yml · push to main]):::outcome --> B[build]:::build --> R[redirect-stubs.ts]:::build --> GP[deploy-pages]:::deploy

  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef test fill:#dcfce7,stroke:#16a34a,color:#111
  classDef build fill:#ffedd5,stroke:#ea580c,color:#111
  classDef deploy fill:#ede9fe,stroke:#7c3aed,color:#111
  classDef gate fill:#fee2e2,stroke:#dc2626,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

- **nightly:** the whole slow lane and fast-suite timings against a 2 s budget; a failure files a `needs-triage` issue.
- **security:** Trivy over dependencies, config and secrets; reports everything, fails only on real risk.
- **deploy.yml (temporary):** publishes redirect stubs from the old GitHub Pages URLs to hancrafted.net.

## 6. Complete landscape

```mermaid
flowchart TD
  subgraph LOCAL["Local"]
    direction TB
    C([git commit]):::outcome --> DG[drive guard]:::check --> PF1[preflight]:::check --> CE[check:events]:::check --> LS[lint-staged]:::check
    LS --> ACS[archgate check --staged]:::check --> LB1[lint:boundaries]:::check --> TC1[typecheck]:::check --> VC[vitest run --changed]:::test
    VC --> CM[commit-msg]:::check --> PU([git push]):::outcome
    PU --> PF2[preflight]:::check --> AF1[archgate:full]:::check --> V[verify plan]:::check --> NT1[npm test]:::test --> TS[test:slow --changed]:::test
    TS --> LQ{build needed?}:::decide
    LQ -- yes --> LB[build]:::build --> LTB[test:build]:::test --> SENT([sent]):::outcome
    LQ -- no --> SENT
  end

  SENT --> CI0

  subgraph CI["ci.yml (every push)"]
    direction TB
    CI0([push]):::outcome --> NC[npm ci]:::setup --> CK[verify:change-kind]:::check

    subgraph STATIC["static"]
      SP[preflight]:::check --> SA[archgate:full]:::check --> SQ{docs-only?}:::decide
      SQ -- no --> SL[lint]:::check --> ST[typecheck]:::check --> SK[knip]:::check --> SF[format:check]:::check
      SQ -- yes --> SF
      SF --> SD[check:docs]:::check
    end

    subgraph UNIT["unit"]
      UQ{docs-only?}:::decide -- no --> UT[npm test]:::test
      UQ -- yes --> UC[vitest run --changed origin/main]:::test
      UT & UC --> UB[over-budget 3 s]:::gate
    end

    subgraph EXPORT["export"]
      EQ{docs-only?}:::decide -- no --> EB[npm run build]:::build --> EU[upload-artifact out]:::build
      EQ -- yes --> EX([skip]):::outcome
    end

    CK --> SP & UQ & EQ
    EU --> BT[test:build]:::test
    EU --> PQ{build and not main?}:::decide
    PQ -- yes --> PV[wrangler pages deploy branch]:::deploy
    BT & EU & EX --> GATE{{gate}}:::gate
    SD & UB & GATE --> GREEN([green]):::outcome
  end

  GREEN --> PR{{PR required checks}}:::gate --> MERGE([merge to main]):::outcome
  MERGE --> MAINCI[ci.yml on main · full run]:::build

  subgraph PROD["deploy-cloudflare.yml"]
    direction TB
    MAINCI --> DQ{CI succeeded?}:::decide
    DQ -- yes --> DR[gh run view]:::check --> DD[download-artifact out]:::build --> DW[wrangler pages deploy main]:::deploy --> LIVE([hancrafted.net]):::outcome
    RB([workflow_dispatch run-id]):::outcome --> DR
  end

  subgraph SCHED["Scheduled"]
    direction LR
    NI([nightly]):::outcome --> NS[test:slow]:::test
    SE([security]):::outcome --> TR[trivy]:::check
    MAINCI --> GH[deploy.yml redirect stubs]:::deploy
  end

  classDef setup fill:#e5e7eb,stroke:#6b7280,color:#111
  classDef decide fill:#fef3c7,stroke:#d97706,color:#111
  classDef check fill:#dbeafe,stroke:#2563eb,color:#111
  classDef test fill:#dcfce7,stroke:#16a34a,color:#111
  classDef build fill:#ffedd5,stroke:#ea580c,color:#111
  classDef deploy fill:#ede9fe,stroke:#7c3aed,color:#111
  classDef gate fill:#fee2e2,stroke:#dc2626,color:#111
  classDef outcome fill:#f1f5f9,stroke:#334155,color:#111
```

In the landscape, parallel steps of the local plans are drawn in sequence to keep it readable; sections 2.1 and 2.2 show the parallel groups.

## Glossary

| Command                                 | What it does                                                                                                                  | Where it runs                                              |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `drive guard`                           | Fails a commit that changes a Decision doc (decision records, feature docs, glossaries) on a branch other than `decisions/*`. | pre-commit                                                 |
| `preflight`                             | Checks the checkout itself: `node_modules` is a real folder, the git hooks are installed, archgate can load its rules.        | pre-commit, pre-push, CI static                            |
| `check:events`                          | Fails if an Episode run's `events` log was edited instead of appended to.                                                     | pre-commit                                                 |
| `lint-staged`                           | Runs `oxlint --fix` and `oxfmt` on the staged files only, so the commit is formatted.                                         | pre-commit                                                 |
| `archgate check --staged`               | Runs the ADR rules (`.archgate/adrs/*.rules.ts`) on the staged files.                                                         | pre-commit                                                 |
| `archgate:full`                         | Runs the ADR rules over every file changed since the repo's first commit.                                                     | pre-push, CI static                                        |
| `lint`                                  | `oxlint` (code lint) plus `lint:boundaries`.                                                                                  | pre-push, CI static                                        |
| `lint:boundaries`                       | `depcruise`: fails an import that crosses a forbidden module boundary in `src`, `skills` or `tools`.                          | pre-commit, pre-push, CI static                            |
| `format:check`                          | `oxfmt --check`: fails on any unformatted file, Markdown included.                                                            | pre-push, CI static                                        |
| `typecheck`                             | `next typegen` then `tsc --noEmit`.                                                                                           | pre-commit, pre-push, CI static                            |
| `knip`                                  | Fails on unused files, exports and dependencies.                                                                              | pre-push, CI static                                        |
| `check:docs`                            | `mh check` (markdown-harness: front matter, headings, freshness of governed docs) plus `check:skills` for every skill folder. | pre-push, CI static                                        |
| `commit-msg`                            | The `/commit` gate: Conventional Commits header, `### Added/Changed/…` body, a `Source:` trailer.                             | commit-msg hook                                            |
| `npm test`                              | `vitest run`: the whole fast suite (`*.test.ts`), each test under 3 s in CI.                                                  | pre-push, CI unit                                          |
| `vitest run --changed`                  | Only the fast tests whose imports reach a changed file (plus the rerun triggers in the vitest config).                        | pre-commit (vs HEAD), CI unit docs lane (vs `origin/main`) |
| `over-budget.ts`                        | Reads the vitest JSON report and fails (CI, 3 s) or warns (nightly, 2 s) on tests over the budget.                            | CI unit, nightly                                           |
| `test:slow`                             | `*.slow.test.ts`: tests that take seconds. Pre-push runs those the branch reaches; nightly runs all.                          | pre-push, nightly                                          |
| `npm run build` (`build`)               | `next build` to the static export `out/`; `prebuild` runs `art` (content-hashed Scene art) first.                             | pre-push (when needed), CI export, deploy.yml              |
| `test:build`                            | `*.build.test.ts` against `out/`: every page URL the app derives exists in the export.                                        | pre-push (when needed), CI build-test                      |
| `verify:change-kind`                    | Reads changed paths on stdin and prints `build=` (an export input changed) and `docs-only=` (every path is Markdown).         | CI static, unit, export                                    |
| `verify:commit` / `verify:push`         | The plans behind the pre-commit and pre-push hooks (`tools/verify/verify.pure.ts`).                                           | hooks                                                      |
| `verify` / `verify:quick`               | The full local check (what CI will say) and a fast one for uncommitted changes. Run by hand.                                  | developer                                                  |
| `upload-artifact` / `download-artifact` | Moves `out/` between jobs and workflows; `main`'s is kept 30 days for rollback, a branch's 1 day.                             | CI export, build-test, preview, deploy                     |
| `wrangler pages deploy`                 | Publishes `out/` to Cloudflare Pages: `--branch=<branch>` for a preview, `--branch=main` for production.                      | CI preview, deploy-cloudflare.yml                          |
| `gh run view`                           | Confirms the run to publish is a successful CI run on `main` before deploying it.                                             | deploy-cloudflare.yml                                      |
| `trivy`                                 | Scans dependencies, config and secrets for known vulnerabilities.                                                             | security.yml                                               |
| `file-issue.sh`                         | Opens a `needs-triage` issue when a nightly check fails.                                                                      | nightly.yml                                                |
| `redirect-stubs.ts`                     | Writes one meta-refresh page per exported URL pointing at hancrafted.net, for the old GitHub Pages site.                      | deploy.yml                                                 |
